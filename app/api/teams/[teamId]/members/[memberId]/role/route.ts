/**
 * app/api/teams/[teamId]/members/[memberId]/role/route.ts
 *
 * PATCH — change a member's role (admin only)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { logTeamActivity } from "@/lib/team-activity";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId, memberId } = await params;
  const body = await request.json();
  const newRole = body.role;

  if (!["ADMIN", "MEMBER", "VIEWER"].includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const isAdmin = team.ownerId === user.id ||
    (await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: user.id } } }))?.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Only admins can change roles" }, { status: 403 });

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!member || member.teamId !== teamId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.teamMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  await createNotification(
    member.userId,
    "Role Updated",
    `Your role in "${team.name}" has been changed to ${newRole}`,
    "info",
    `/teams/${teamId}`
  );

  await logTeamActivity(
    teamId,
    user.id,
    "ROLE_CHANGED",
    `${user.name || user.email} changed ${member.user.name || member.user.email}'s role to ${newRole}`
  );

  return NextResponse.json({ success: true, data: updated });
}
