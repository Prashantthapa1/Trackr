/**
 * app/(dashboard)/reports/page.tsx
 *
 * Reports page with monthly bar chart, category pie chart, trend line,
 * spending heatmap, budget vs actual, and comparative analysis.
 * Pro-gated: FREE users see a locked state with upgrade CTA.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ReportsClient } from "@/components/ReportsClient";
import { ProGate } from "@/components/ProGate";

export default async function ReportsPage() {
  const user = await requireAuth();

  if (user.plan === "FREE") {
    return (
      <ProGate
        title="Visual Reports"
        description="Unlock beautiful charts showing your monthly trends, category breakdown, and spending patterns."
      />
    );
  }

  const now = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Fetch all data in parallel
  const [expenses, budgets, thisMonthExpenses, lastMonthExpenses] =
    await Promise.all([
      prisma.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: twelveMonthsAgo },
        },
        orderBy: { date: "asc" },
      }),
      prisma.budget.findMany({
        where: { userId: user.id },
      }),
      prisma.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: thisMonthStart },
        },
        select: { category: true, amount: true },
      }),
      prisma.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: lastMonthStart, lt: thisMonthStart },
        },
        select: { category: true, amount: true },
      }),
    ]);

  // Build monthly data
  const monthlyMap = new Map<string, number>();
  const categoryMap = new Map<string, { total: number; count: number }>();
  const dailyMap = new Map<string, number>();

  for (const exp of expenses) {
    const monthKey = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + exp.amount);

    const catData = categoryMap.get(exp.category) ?? { total: 0, count: 0 };
    catData.total += exp.amount;
    catData.count += 1;
    categoryMap.set(exp.category, catData);

    const dayKey = exp.date.toISOString().split("T")[0];
    dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + exp.amount);
  }

  const monthlyData = Array.from(monthlyMap.entries()).map(
    ([month, total]) => ({
      month,
      total: Math.round(total * 100) / 100,
    })
  );

  const categoryData = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    })
  );

  const dailyData = Array.from(dailyMap.entries()).map(([date, total]) => ({
    date,
    total: Math.round(total * 100) / 100,
  }));

  // Budget data
  const spendingByCategory = Object.fromEntries(
    thisMonthExpenses.reduce<Map<string, number>>((acc, e) => {
      acc.set(e.category, (acc.get(e.category) ?? 0) + e.amount);
      return acc;
    }, new Map<string, number>())
  );
  const totalMonthSpend = thisMonthExpenses.reduce((s: number, e) => s + e.amount, 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const serializedBudgets = budgets.map((b) => ({
    id: b.id,
    name: b.name,
    amount: b.amount,
    period: b.period,
    category: b.category,
    startDate: b.startDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
  }));

  // Comparative data: this month vs last month per category
  const thisMonthByCat = new Map<string, number>();
  const lastMonthByCat = new Map<string, number>();
  for (const e of thisMonthExpenses) {
    thisMonthByCat.set(e.category, (thisMonthByCat.get(e.category) ?? 0) + e.amount);
  }
  for (const e of lastMonthExpenses) {
    lastMonthByCat.set(e.category, (lastMonthByCat.get(e.category) ?? 0) + e.amount);
  }
  const allCats = new Set([...thisMonthByCat.keys(), ...lastMonthByCat.keys()]);
  const comparisonData = Array.from(allCats).map((category) => ({
    category,
    thisMonth: Math.round((thisMonthByCat.get(category) ?? 0) * 100) / 100,
    lastMonth: Math.round((lastMonthByCat.get(category) ?? 0) * 100) / 100,
  }));

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-heading text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground font-body">
          Visualize your spending patterns and trends.
        </p>
      </div>
      <div className="animate-fade-up-delay-1">
        <ReportsClient
          monthlyData={monthlyData}
          categoryData={categoryData}
          dailyData={dailyData}
          budgets={serializedBudgets}
          spendingByCategory={spendingByCategory}
          totalMonthSpend={totalMonthSpend}
          daysInMonth={daysInMonth}
          dayOfMonth={dayOfMonth}
          comparisonData={comparisonData}
        />
      </div>
    </div>
  );
}
