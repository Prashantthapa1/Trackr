/**
 * app/api/teams/[teamId]/route.ts
 *
 * GET    — team details + members
 * PATCH  — update team settings (admin only)
 * DELETE — delete team (owner only)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { logTeamActivity } from "@/lib/team-activity";

async function getTeamAndRole(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, name: true, image: true } } },
      },
      _count: { select: { expenses: true, budgets: true } },
    },
  });
  if (!team) return null;

  if (team.ownerId === userId) return { team, role: "ADMIN" as const };
  const membership = team.members.find((m) => m.userId === userId);
  if (!membership) return null;
  return { team, role: membership.role };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const result = await getTeamAndRole(teamId, user.id);
  if (!result) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const { team, role } = result;
  const owner = team.ownerId === user.id
    ? { id: user.id, email: user.email, name: user.name }
    : await prisma.user.findUnique({
        where: { id: team.ownerId },
        select: { id: true, email: true, name: true },
      });

  return NextResponse.json({
    success: true,
    data: {
      id: team.id,
      name: team.name,
      avatar: team.avatar,
      description: team.description,
      ownerId: team.ownerId,
      owner,
      myRole: role,
      members: team.members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        email: m.user.email,
        name: m.user.name,
        image: m.user.image,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
      stats: {
        expenses: team._count.expenses,
        budgets: team._count.budgets,
        members: team.members.length,
      },
      createdAt: team.createdAt.toISOString(),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const result = await getTeamAndRole(teamId, user.id);
  if (!result) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (result.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json();
  const updated = await prisma.team.update({
    where: { id: teamId },
    data: {
      name: body.name ?? undefined,
      avatar: body.avatar ?? undefined,
      description: body.description ?? undefined,
    },
  });

  await logTeamActivity(teamId, user.id, "BUDGET_UPDATED", `${user.name || user.email} updated team settings`);

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (team.ownerId !== user.id) return NextResponse.json({ error: "Only the owner can delete a team" }, { status: 403 });

  await prisma.team.delete({ where: { id: teamId } });

  return NextResponse.json({ success: true });
}
