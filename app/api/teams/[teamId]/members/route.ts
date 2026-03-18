/**
 * app/api/teams/[teamId]/members/route.ts
 *
 * GET    — list team members
 * DELETE — remove a member (admin only)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { logTeamActivity } from "@/lib/team-activity";
import { createNotification } from "@/lib/notifications";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Check access
  const isMember = team.ownerId === user.id ||
    await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: user.id } } });
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, email: true, name: true, image: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      image: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const { searchParams } = request.nextUrl;
  const memberId = searchParams.get("memberId");
  if (!memberId) return NextResponse.json({ error: "memberId is required" }, { status: 400 });

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const isAdmin = team.ownerId === user.id ||
    (await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: user.id } } }))?.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!member || member.teamId !== teamId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Can't remove team owner
  if (member.userId === team.ownerId) {
    return NextResponse.json({ error: "Cannot remove the team owner" }, { status: 400 });
  }

  await prisma.teamMember.delete({ where: { id: memberId } });

  await createNotification(
    member.userId,
    "Removed from Team",
    `You've been removed from "${team.name}"`,
    "warning"
  );

  await logTeamActivity(
    teamId,
    user.id,
    "MEMBER_REMOVED",
    `${user.name || user.email} removed ${member.user.name || member.user.email}`
  );

  return NextResponse.json({ success: true });
}
