/**
 * app/api/teams/[teamId]/invite/route.ts
 *
 * POST — invite a user to the team (admin only, in-app notification)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { inviteTeamMemberSchema } from "@/types";
import { logTeamActivity } from "@/lib/team-activity";
import { createNotification } from "@/lib/notifications";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;

  // Check team exists and user is admin
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  });

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const isAdmin = team.ownerId === user.id || membership?.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });

  const body = await request.json();
  const parsed = inviteTeamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { email, role } = parsed.data;

  if (email === user.email) {
    return NextResponse.json({ error: "You can't invite yourself" }, { status: 400 });
  }

  // Check member count limit (5 for PRO, unlimited for ENTERPRISE)
  const memberCount = await prisma.teamMember.count({ where: { teamId } });
  const ownerUser = await prisma.user.findUnique({ where: { id: team.ownerId }, select: { plan: true } });
  const maxMembers = ownerUser?.plan === "ENTERPRISE" ? Infinity : 5;

  if (memberCount >= maxMembers) {
    return NextResponse.json({ error: `Team member limit reached (${maxMembers} max)` }, { status: 403 });
  }

  // Check if user exists
  const invitee = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!invitee) {
    return NextResponse.json(
      { error: "No user found with that email. They need to create an account first." },
      { status: 404 }
    );
  }

  // Check if already a member
  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: invitee.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "This user is already a team member" }, { status: 409 });
  }

  // Check for pending invitation
  const pendingInvite = await prisma.teamInvitation.findFirst({
    where: { teamId, email, status: "PENDING" },
  });
  if (pendingInvite) {
    return NextResponse.json({ error: "An invitation is already pending for this email" }, { status: 409 });
  }

  // Create invitation
  const token = crypto.randomBytes(32).toString("hex");
  const invitation = await prisma.teamInvitation.create({
    data: {
      teamId,
      email,
      role: role as "ADMIN" | "MEMBER" | "VIEWER",
      token,
      invitedBy: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Send in-app notification to the invitee
  await createNotification(
    invitee.id,
    "Team Invitation",
    `${user.name || user.email} invited you to join "${team.name}" as ${role}`,
    "info",
    `/teams/invitations`
  );

  await logTeamActivity(
    teamId,
    user.id,
    "MEMBER_INVITED",
    `${user.name || user.email} invited ${email} as ${role}`
  );

  return NextResponse.json(
    { success: true, data: { id: invitation.id, email, role, status: "PENDING" } },
    { status: 201 }
  );
}
