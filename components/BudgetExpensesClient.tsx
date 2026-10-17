"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { ExpenseRow } from "@/types";
import { ArrowDownAZ, ArrowUpAZ, Calendar, Pencil, Receipt, Trash2 } from "lucide-react";

export function BudgetExpensesClient({ initialExpenses, budgetId, budgetName }: { initialExpenses: ExpenseRow[]; budgetId: string; budgetName: string }) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [range, setRange] = useState("all");
  const [sort, setSort] = useState<"date" | "high" | "low">("date");
  const filtered = useMemo(() => {
    const now = new Date();
    const items = expenses.filter((expense) => range === "all" || new Date(expense.date) >= new Date(now.getFullYear(), now.getMonth() - (range === "year" ? 12 : 1), 1));
    return items.sort((a, b) => sort === "high" ? b.amount - a.amount : sort === "low" ? a.amount - b.amount : new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, range, sort]);
  const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);

  async function deleteExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (response.ok) { setExpenses((current) => current.filter((expense) => expense.id !== id)); router.refresh(); }
  }

  async function editExpense(expense: ExpenseRow) {
    const amount = prompt("Amount", String(expense.amount));
    if (amount === null) return;
    const description = prompt("Description", expense.description ?? "");
    if (description === null) return;
    const response = await fetch(`/api/expenses/${expense.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), description, budgetId }) });
    if (response.ok) { const result = await response.json(); setExpenses((current) => current.map((item) => item.id === expense.id ? { ...item, ...result.data } : item)); }
  }

  return <section className="rounded-xl border bg-card p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{budgetName} expenses</h2><p className="text-sm text-muted-foreground">{filtered.length} expenses · {formatCurrency(total, "NPR")}</p></div><div className="flex gap-2"><select className="rounded-md border bg-background px-3 py-2 text-sm" value={range} onChange={(event) => setRange(event.target.value)}><option value="all">All time</option><option value="month">This month</option><option value="year">Last 12 months</option></select><Button variant="outline" size="sm" onClick={() => setSort(sort === "high" ? "low" : "high")}>{sort === "high" ? <ArrowDownAZ className="mr-2 h-4 w-4" /> : <ArrowUpAZ className="mr-2 h-4 w-4" />}{sort === "date" ? "Sort amount" : sort === "high" ? "High to low" : "Low to high"}</Button></div></div>
    {filtered.length === 0 ? <p className="py-10 text-center text-muted-foreground">No expenses in this budget for the selected period.</p> : <div className="divide-y">{filtered.map((expense) => <div key={expense.id} className="flex items-center justify-between gap-4 py-4"><div className="flex min-w-0 items-center gap-3"><Receipt className="h-5 w-5 shrink-0 text-green-500" /><div className="min-w-0"><p className="font-medium">{expense.category} · {formatCurrency(expense.amount, expense.currency)}</p><p className="truncate text-sm text-muted-foreground">{expense.description || "No description"} · {new Date(expense.date).toLocaleDateString()}</p>{expense.receiptUrl && <a className="text-xs text-green-600 hover:underline" href={expense.receiptUrl} target="_blank" rel="noreferrer">View receipt</a>}</div></div><div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" title="Edit" onClick={() => editExpense(expense)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="Delete" onClick={() => deleteExpense(expense.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></div>)}</div>}
  </section>;
}
