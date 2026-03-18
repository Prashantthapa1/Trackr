/**
 * components/BudgetClient.tsx
 *
 * Client Component for budget management with progress bars.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORIES } from "@/types";
import type { BudgetRow } from "@/types";
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface BudgetClientProps {
  budgets: BudgetRow[];
  plan: string;
  spendingByCategory: Record<string, number>;
  totalMonthSpend: number;
}

export function BudgetClient({
  budgets: initialBudgets,
  plan,
  spendingByCategory,
  totalMonthSpend,
}: BudgetClientProps) {
  const router = useRouter();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [category, setCategory] = useState("");

  const isPro = plan !== "FREE";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        amount: parseFloat(amount),
        period,
        category: category || undefined,
      };

      const res = await fetch(editingId ? `/api/budgets/${editingId}` : "/api/budgets", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to create budget");
        return;
      }
      setName("");
      setAmount("");
      setPeriod("monthly");
      setCategory("");
      setShowForm(false);
      setEditingId(null);
      router.refresh();
      const fresh = await fetch("/api/budgets");
      const json = await fresh.json();
      if (json.success) setBudgets(json.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this budget?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  function handleEdit(budget: BudgetRow) {
    setEditingId(budget.id);
    setName(budget.name);
    setAmount(String(budget.amount));
    setPeriod(budget.period);
    setCategory(budget.category ?? "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getSpent(budget: BudgetRow): number {
    if (budget.category) {
      return spendingByCategory[budget.category] ?? 0;
    }
    return totalMonthSpend;
  }

  function getProgressColor(pct: number): string {
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80) return "bg-amber-500";
    return "bg-green-500";
  }

  function getStatusIcon(pct: number) {
    if (pct >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (pct >= 80) return <TrendingUp className="h-4 w-4 text-amber-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }

  return (
    <div className="space-y-6">
      {budgets.length === 0 ? (
        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">No budgets yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Set a monthly spending goal to stay on track.
            </p>
            <Button onClick={() => setShowForm(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create your first budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const spent = getSpent(budget);
            const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
            const remaining = budget.amount - spent;

            return (
              <Card key={budget.id} className="relative border-green-200/50 dark:border-green-800/30">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="font-heading text-base">{budget.name}</CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {budget.period}
                      </Badge>
                      {budget.category && (
                        <Badge variant="outline" className="text-xs">
                          {budget.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(pct)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-green-600 dark:hover:text-green-400"
                      onClick={() => handleEdit(budget)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                      onClick={() => handleDelete(budget.id)}
                      disabled={deleting === budget.id}
                    >
                      {deleting === budget.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(spent, "NPR")} spent
                    </span>
                    <span className="font-heading font-semibold text-foreground">
                      {formatCurrency(budget.amount, "NPR")}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(pct)}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{pct}% used</span>
                    <span>
                      {remaining >= 0
                        ? `${formatCurrency(remaining, "NPR")} left`
                        : `${formatCurrency(Math.abs(remaining), "NPR")} over!`}
                    </span>
                  </div>
                  {pct >= 100 && (
                    <p className="mt-3 text-xs font-medium text-red-500">
                      Budget exceeded! Consider reducing spending.
                    </p>
                  )}
                  {pct >= 80 && pct < 100 && (
                    <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
                      Almost at limit — {100 - pct}% remaining.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!showForm && budgets.length > 0 && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      )}

      {showForm && (
        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardHeader>
            <CardTitle className="font-heading">
              {editingId ? "Edit Budget" : "New Budget"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="budget-name">Name</Label>
                <Input
                  id="budget-name"
                  placeholder="e.g. Monthly Overall"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-amount">Amount (NPR)</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-period">Period</Label>
                <Select value={period} onValueChange={setPeriod} disabled={!isPro}>
                  <SelectTrigger id="budget-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {!isPro && (
                  <p className="text-xs text-muted-foreground">
                    Monthly only on Free plan
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-category">Category (optional)</Label>
                <Select
                  value={category === "" ? "__overall__" : category}
                  onValueChange={(v) => setCategory(v === "__overall__" ? "" : v)}
                  disabled={!isPro}
                >
                  <SelectTrigger id="budget-category">
                    <SelectValue placeholder="Overall" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__overall__">Overall</SelectItem>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isPro && (
                  <p className="text-xs text-muted-foreground">
                    Per-category budgets require PRO
                  </p>
                )}
              </div>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Create Budget"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
