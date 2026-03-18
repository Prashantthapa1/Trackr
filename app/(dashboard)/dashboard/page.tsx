/**
 * app/(dashboard)/dashboard/page.tsx
 *
 * Main dashboard page with green design system styling.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getMonthlyUsage } from "@/lib/usage";
import { formatCurrency } from "@/lib/currency";
import { getCategoriesForPlan } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageRing } from "@/components/UsageRing";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseTable } from "@/components/ExpenseTable";
import { DollarSign, TrendingUp, CreditCard, Calendar, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireAuth();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [expenses, usage, monthTotal, budgets, categorySpending] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 50,
    }),
    getMonthlyUsage(user.id),
    prisma.expense.aggregate({
      where: {
        userId: user.id,
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.budget.findMany({
      where: { userId: user.id },
      take: 5,
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: {
        userId: user.id,
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const spendingByCategory: Record<string, number> = {};
  for (const item of categorySpending) {
    spendingByCategory[item.category] = item._sum.amount ?? 0;
  }

  const totalThisMonth = monthTotal._sum.amount ?? 0;
  const countThisMonth = monthTotal._count ?? 0;
  const avgExpense = countThisMonth > 0 ? totalThisMonth / countThisMonth : 0;

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = monthStart;
  const lastMonthTotal = await prisma.expense.aggregate({
    where: {
      userId: user.id,
      date: { gte: lastMonthStart, lt: lastMonthEnd },
    },
    _sum: { amount: true },
  });

  const lastMonthAmount = lastMonthTotal._sum.amount ?? 0;
  const percentChange =
    lastMonthAmount > 0
      ? ((totalThisMonth - lastMonthAmount) / lastMonthAmount) * 100
      : 0;

  const categories = getCategoriesForPlan(user.plan);

  const serializedExpenses = expenses.map((e) => ({
    id: e.id,
    amount: e.amount,
    currency: e.currency,
    category: e.category,
    description: e.description,
    date: e.date.toISOString(),
    receiptUrl: e.receiptUrl,
    tags: e.tags ?? [],
    createdAt: e.createdAt.toISOString(),
  }));

  const usageInfo = {
    count: usage.count,
    limit: usage.limit,
    month: usage.month,
    percentage: Math.round((usage.count / usage.limit) * 100),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground font-body">
          Welcome back, {user.name ?? "there"}! Here&apos;s your expense overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group animate-fade-up-delay-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
              {percentChange !== 0 && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                    percentChange > 0
                      ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  )}
                >
                  <TrendingUp className={cn("h-3 w-3", percentChange < 0 && "rotate-180")} />
                  {Math.abs(percentChange).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">This Month</p>
            <p className="font-heading text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalThisMonth, "NPR")}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              vs {formatCurrency(lastMonthAmount, "NPR")} last month
            </p>
          </CardContent>
        </Card>

        <Card className="group animate-fade-up-delay-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Expenses</p>
            <p className="font-heading text-2xl font-bold text-foreground">{countThisMonth}</p>
            <p className="text-xs text-muted-foreground mt-2">transactions this month</p>
          </CardContent>
        </Card>

        <Card className="group animate-fade-up-delay-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Average</p>
            <p className="font-heading text-2xl font-bold text-foreground">
              {formatCurrency(avgExpense, "NPR")}
            </p>
            <p className="text-xs text-muted-foreground mt-2">per expense</p>
          </CardContent>
        </Card>

        <Card className="group animate-fade-up-delay-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="stat-icon-box bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Usage</p>
            <UsageRing usage={usageInfo} plan={user.plan} />
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      <Card className="animate-fade-up-delay-5">
        <CardHeader>
          <CardTitle className="font-heading">Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            categories={categories as string[]}
            plan={user.plan}
            usage={usageInfo}
          />
        </CardContent>
      </Card>

      {/* Budget Progress */}
      {budgets.length > 0 && (
        <Card className="fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading">
              <Target className="h-5 w-5 text-green-500" />
              Budget Progress
            </CardTitle>
            <Link href="/budgets">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((budget, index) => {
              const spent = budget.category
                ? (spendingByCategory[budget.category] ?? 0)
                : totalThisMonth;
              const pct = budget.amount > 0 ? Math.min(Math.round((spent / budget.amount) * 100), 100) : 0;
              const remaining = budget.amount - spent;
              const barColor = pct >= 100 ? "bg-gradient-to-r from-red-500 to-red-400" : pct >= 80 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-green-500 to-green-400";
              return (
                <div key={budget.id} className="row-animate" style={{ '--row-index': index } as React.CSSProperties}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {budget.name}
                      {budget.category && <span className="text-muted-foreground"> ({budget.category})</span>}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(spent, "NPR")} / {formatCurrency(budget.amount, "NPR")}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {remaining >= 0
                      ? `${formatCurrency(remaining, "NPR")} remaining`
                      : `${formatCurrency(Math.abs(remaining), "NPR")} over budget!`}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Expense Table */}
      <Card className="fade-in" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="font-heading">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseTable expenses={serializedExpenses} plan={user.plan} />
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {user.plan === "FREE" && (
        <div className="upgrade-cta-section fade-in" style={{ animationDelay: '0.5s' }}>
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-300/20 blur-3xl animate-float-blob" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/25 to-green-300/15 blur-3xl animate-float-blob-delayed" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium text-white mb-4">
              <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
              Pro Features Available
            </div>
            <h2 className="font-heading text-3xl font-bold text-white">
              Ready to unlock more?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-green-100/90 text-lg">
              Get unlimited expenses, team workspaces, advanced reports, and more with Pro.
            </p>
            <div className="mt-8">
              <Link href="/upgrade">
                <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
