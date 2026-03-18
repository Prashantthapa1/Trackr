/**
 * app/api/teams/[teamId]/leave/route.ts
 *
 * POST — leave a team (any non-owner member)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { logTeamActivity } from "@/lib/team-activity";
import { notifyTeamMembers } from "@/lib/notifications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (team.ownerId === user.id) {
    return NextResponse.json({ error: "Owners cannot leave their own team. Transfer ownership or delete the team." }, { status: 400 });
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 400 });

  await prisma.teamMember.delete({ where: { id: membership.id } });

  await logTeamActivity(teamId, user.id, "MEMBER_LEFT", `${user.name || user.email} left the team`);
  await notifyTeamMembers(teamId, "Member Left", `${user.name || user.email} left "${team.name}"`, "info", undefined, user.id);

  return NextResponse.json({ success: true });
}
