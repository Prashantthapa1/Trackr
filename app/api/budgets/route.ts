/**
 * app/api/budgets/route.ts
 *
 * CRUD API for budgets. GET returns all budgets for the authenticated user.
 * POST creates a new budget. FREE users can set 1 overall budget;
 * PRO users get unlimited budgets including per-category budgets.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createBudgetSchema } from "@/types";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: budgets });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createBudgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // FREE users: max 1 budget (overall only)
  if (user.plan === "FREE") {
    const existingCount = await prisma.budget.count({
      where: { userId: user.id },
    });
    if (existingCount >= 1) {
      return NextResponse.json(
        { error: "Free plan allows only 1 budget. Upgrade to PRO for unlimited budgets." },
        { status: 403 }
      );
    }
    if (parsed.data.category) {
      return NextResponse.json(
        { error: "Per-category budgets require PRO plan." },
        { status: 403 }
      );
    }
  }

  const budget = await prisma.budget.create({
    data: {
      name: parsed.data.name,
      amount: parsed.data.amount,
      period: parsed.data.period ?? "monthly",
      category: parsed.data.category ?? null,
      userId: user.id,
    },
  });

  return NextResponse.json({ success: true, data: budget }, { status: 201 });
}
