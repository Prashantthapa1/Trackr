/**
 * app/api/teams/[teamId]/expenses/route.ts
 *
 * GET  — list team expenses
 * POST — add expense to team
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { createExpenseSchema } from "@/types";
import { logTeamActivity } from "@/lib/team-activity";
import { notifyTeamMembers } from "@/lib/notifications";

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
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const role = await getMemberRole(teamId, user.id);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: { teamId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where: { teamId } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      expenses: expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        currency: e.currency,
        category: e.category,
        description: e.description,
        date: e.date.toISOString(),
        receiptUrl: e.receiptUrl,
        tags: e.tags,
        approvalStatus: e.approvalStatus,
        addedBy: { id: e.user.id, name: e.user.name, email: e.user.email },
        createdAt: e.createdAt.toISOString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
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
  if (role === "VIEWER") return NextResponse.json({ error: "Viewers cannot add expenses" }, { status: 403 });

  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      amount: parsed.data.amount,
      currency: parsed.data.currency || "NPR",
      category: parsed.data.category,
      description: parsed.data.description || null,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      receiptUrl: parsed.data.receiptUrl || null,
      tags: parsed.data.tags || [],
      userId: user.id,
      teamId,
    },
  });

  await logTeamActivity(
    teamId,
    user.id,
    "EXPENSE_ADDED",
    `${user.name || user.email} added NPR ${parsed.data.amount.toFixed(2)} expense to "${parsed.data.category}"`
  );

  // Notify team for large expenses
  if (parsed.data.amount >= 10000) {
    await notifyTeamMembers(
      teamId,
      "Large Expense Added",
      `${user.name || user.email} added a NPR ${parsed.data.amount.toLocaleString()} expense`,
      "warning",
      `/teams/${teamId}`,
      user.id
    );
  }

  return NextResponse.json({ success: true, data: expense }, { status: 201 });
}
