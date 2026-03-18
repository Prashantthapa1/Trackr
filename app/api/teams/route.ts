/**
 * app/api/teams/route.ts
 *
 * GET  — list all teams the user owns or is a member of
 * POST — create a new team (PRO only, max 3)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { createTeamSchema } from "@/types";
import { logTeamActivity } from "@/lib/team-activity";

const MAX_TEAMS = 3;

export async function GET(): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Teams I own
  const owned = await prisma.team.findMany({
    where: { ownerId: user.id },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Teams I'm a member of (not owner)
  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: { _count: { select: { members: true } } },
      },
    },
  });

  const teams = [
    ...owned.map((t) => ({
      id: t.id,
      name: t.name,
      avatar: t.avatar,
      description: t.description,
      ownerId: t.ownerId,
      memberCount: t._count.members + 1, // +1 for owner
      role: "ADMIN" as const,
      createdAt: t.createdAt.toISOString(),
    })),
    ...memberships
      .filter((m) => m.team.ownerId !== user.id)
      .map((m) => ({
        id: m.team.id,
        name: m.team.name,
        avatar: m.team.avatar,
        description: m.team.description,
        ownerId: m.team.ownerId,
        memberCount: m.team._count.members + 1,
        role: m.role,
        createdAt: m.team.createdAt.toISOString(),
      })),
  ];

  return NextResponse.json({ success: true, data: teams });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.plan === "FREE") {
    return NextResponse.json(
      { error: "Team features require a Pro plan" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Check team limit
  const ownedCount = await prisma.team.count({ where: { ownerId: user.id } });
  if (ownedCount >= MAX_TEAMS && user.plan !== "ENTERPRISE") {
    return NextResponse.json(
      { error: `You can create up to ${MAX_TEAMS} teams on the Pro plan` },
      { status: 403 }
    );
  }

  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      avatar: parsed.data.avatar || "👥",
      description: parsed.data.description || null,
      ownerId: user.id,
    },
  });

  // Owner is automatically an admin member
  await prisma.teamMember.create({
    data: { teamId: team.id, userId: user.id, role: "ADMIN" },
  });

  await logTeamActivity(team.id, user.id, "MEMBER_JOINED", `${user.name || user.email} created the team`);

  return NextResponse.json({ success: true, data: team }, { status: 201 });
}
