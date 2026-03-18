/**
 * app/api/teams/invitations/[invitationId]/route.ts
 *
 * POST — accept or decline an invitation
 * body: { action: "accept" | "decline" }
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { logTeamActivity } from "@/lib/team-activity";
import { notifyTeamMembers } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invitationId } = await params;
  const body = await request.json();
  const action = body.action;

  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const invitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
    include: { team: { select: { name: true } } },
  });

  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (invitation.email !== user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (invitation.status !== "PENDING") return NextResponse.json({ error: "Invitation already processed" }, { status: 400 });
  if (invitation.expiresAt < new Date()) {
    await prisma.teamInvitation.update({ where: { id: invitationId }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
  }

  if (action === "decline") {
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: "DECLINED" },
    });
    return NextResponse.json({ success: true, message: "Invitation declined" });
  }

  // Accept: add user as team member
  await prisma.$transaction([
    prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    }),
    prisma.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId: user.id,
        role: invitation.role,
      },
    }),
  ]);

  await logTeamActivity(
    invitation.teamId,
    user.id,
    "MEMBER_JOINED",
    `${user.name || user.email} joined the team`
  );

  await notifyTeamMembers(
    invitation.teamId,
    "New Member",
    `${user.name || user.email} joined "${invitation.team.name}"`,
    "success",
    `/teams/${invitation.teamId}`,
    user.id
  );

  return NextResponse.json({ success: true, message: "Welcome to the team!", teamId: invitation.teamId });
}
