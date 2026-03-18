/**
 * app/api/expenses/[id]/route.ts
 *
 * PATCH: Updates an existing expense (partial update via Zod partial schema).
 * DELETE: Removes an expense and decrements the monthly usage counter.
 *
 * Both routes verify ownership — a user can only modify their own expenses.
 * This prevents horizontal privilege escalation where user A guesses user B's
 * expense ID.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { decrementUsage } from "@/lib/usage";
import { updateExpenseSchema } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // Verify ownership
  const existing = await prisma.expense.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (existing.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.date) {
    updateData.date = new Date(parsed.data.date);
  }

  // Receipt uploads are Pro-only
  if (parsed.data.receiptUrl && user.plan === "FREE") {
    return NextResponse.json(
      { error: "Receipt uploads require a Pro plan" },
      { status: 403 }
    );
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    data: {
      id: expense.id,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString(),
      receiptUrl: expense.receiptUrl,
      createdAt: expense.createdAt.toISOString(),
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // Verify ownership
  const existing = await prisma.expense.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  if (existing.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.expense.delete({ where: { id } });

  // Decrement usage counter
  await decrementUsage(user.id);

  return NextResponse.json({ success: true });
}
