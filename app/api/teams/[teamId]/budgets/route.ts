/**
 * app/api/teams/[teamId]/budgets/route.ts
 *
 * GET  — list team budgets
 * POST — create a team budget (admin only)
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { createTeamBudgetSchema } from "@/types";
import { logTeamActivity } from "@/lib/team-activity";

async function getMemberRole(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return null;
  if (team.ownerId === userId) return "ADMIN";
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  return membership?.role ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const role = await getMemberRole(teamId, user.id);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const budgets = await prisma.teamBudget.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const expenses = await prisma.expense.findMany({
    where: {
      teamId,
      date: { gte: monthStart, lt: monthEnd },
    },
  });

  const budgetsWithSpent = budgets.map((b) => {
    let spent = 0;
    if (b.category) {
      spent = expenses
        .filter((e) => e.category?.toLowerCase() === b.category?.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);
    } else {
      spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    }
    return { ...b, spent, categoryName: b.category };
  });

  return NextResponse.json({ success: true, data: budgetsWithSpent });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const role = await getMemberRole(teamId, user.id);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admins can create budgets" }, { status: 403 });

  const body = await request.json();
  const parsed = createTeamBudgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const budget = await prisma.teamBudget.create({
    data: {
      name: parsed.data.name,
      amount: parsed.data.amount,
      period: parsed.data.period || "monthly",
      category: parsed.data.category || null,
      teamId,
    },
  });

  await logTeamActivity(
    teamId,
    user.id,
    "BUDGET_CREATED",
    `${user.name || user.email} created budget "${parsed.data.name}" for NPR ${parsed.data.amount}`
  );

  return NextResponse.json({ success: true, data: budget }, { status: 201 });
}
