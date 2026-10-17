import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getMonthlyUsage } from "@/lib/usage";
import { getCategoriesForPlan } from "@/types";
import { ExpenseForm } from "@/components/ExpenseForm";
import { BudgetExpensesClient } from "@/components/BudgetExpensesClient";

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const budget = await prisma.budget.findFirst({ where: { id, userId: user.id } });
  if (!budget) notFound();

  const [expenses, usage] = await Promise.all([
    prisma.expense.findMany({ where: { budgetId: budget.id, userId: user.id }, orderBy: { date: "desc" } }),
    getMonthlyUsage(user.id),
  ]);
  const serialized = expenses.map((expense) => ({
    id: expense.id, amount: expense.amount, currency: expense.currency,
    category: expense.category, description: expense.description,
    date: expense.date.toISOString(), receiptUrl: expense.receiptUrl,
    tags: expense.tags ?? [], createdAt: expense.createdAt.toISOString(), budgetId: expense.budgetId,
  }));
  const usageInfo = { count: usage.count, limit: usage.limit, month: usage.month, percentage: Math.round((usage.count / usage.limit) * 100) };

  return <div className="space-y-8">
    <div><h1 className="font-heading text-3xl font-bold">{budget.name}</h1><p className="text-muted-foreground">Expenses assigned to this budget, across every category.</p></div>
    <div className="rounded-xl border bg-card p-6"><h2 className="mb-4 text-xl font-semibold">Add expense to budget</h2><ExpenseForm categories={getCategoriesForPlan(user.plan) as string[]} plan={user.plan} usage={usageInfo} budgetId={budget.id} /></div>
    <BudgetExpensesClient initialExpenses={serialized} budgetId={budget.id} budgetName={budget.name} />
  </div>;
}
