/**
 * app/api/expenses/route.ts
 *
 * GET: Returns the authenticated user's expenses (paginated, most recent first).
 * POST: Creates a new expense after validating with Zod. For FREE users, it
 * checks the monthly usage count BEFORE creating — if at limit, returns 403.
 * After creation, it increments the Usage counter via lib/usage.ts.
 *
 * Both handlers use getSession() and return 401 if unauthenticated.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { isAtLimit, incrementUsage } from "@/lib/usage";
import { createExpenseSchema } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: user.id, teamId: null },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where: { userId: user.id, teamId: null } }),
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
        createdAt: e.createdAt.toISOString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check usage limit for FREE users
  const atLimit = await isAtLimit(user.id, user.plan);
  if (atLimit) {
    return NextResponse.json(
      {
        error: "Monthly expense limit reached. Upgrade to Pro for unlimited expenses.",
        code: "LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { amount, currency, category, description, date, receiptUrl } =
    parsed.data;

  // Receipt uploads are Pro-only
  if (receiptUrl && user.plan === "FREE") {
    return NextResponse.json(
      { error: "Receipt uploads require a Pro plan" },
      { status: 403 }
    );
  }

  const expense = await prisma.expense.create({
    data: {
      amount,
      currency,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      receiptUrl,
      userId: user.id,
    },
  });

  // Increment the usage counter
  const newCount = await incrementUsage(user.id);

  return NextResponse.json(
    {
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
      usage: { count: newCount },
    },
    { status: 201 }
  );
}
