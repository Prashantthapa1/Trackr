/**
 * app/(dashboard)/budgets/page.tsx
 *
 * Server Component for the budgets page. Fetches user's budgets and
 * current month spending data, then passes to BudgetClient for interactive
 * management. FREE users can set 1 overall budget; PRO unlocks unlimited
 * per-category budgets with progress tracking.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { BudgetClient } from "@/components/BudgetClient";

export default async function BudgetsPage() {
  const user = await requireAuth();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Fetch budgets and expenses in parallel
  const [budgets, categorySpending, totalSpent] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: {
        userId: user.id,
        teamId: null,
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: {
        userId: user.id,
        teamId: null,
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const spendingByCategory = Object.fromEntries(
    categorySpending.flatMap((c) => {
      const raw = (c.category ?? "").toString().trim();
      const sum = c._sum.amount ?? 0;
      const lower = raw.toLowerCase();
      // expose both exact and lower-cased keys for robust lookup
      return raw && raw !== lower ? [[raw, sum], [lower, sum]] : [[raw, sum]];
    })
  );
  const totalMonthSpend = totalSpent._sum.amount ?? 0;

  const serializedBudgets = budgets.map((b) => ({
    id: b.id,
    name: b.name,
    amount: b.amount,
    period: b.period,
    category: b.category ? b.category.trim() : null,
    startDate: b.startDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-heading text-3xl font-bold text-foreground">Budgets & Goals</h1>
        <p className="text-muted-foreground font-body">
          Set spending limits and track your progress.
        </p>
      </div>
      <div className="animate-fade-up-delay-1">
        <BudgetClient
          budgets={serializedBudgets}
          plan={user.plan}
          spendingByCategory={spendingByCategory}
          totalMonthSpend={totalMonthSpend}
        />
      </div>
    </div>
  );
}
