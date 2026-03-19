/**
 * components/team/TeamExpensesList.tsx
 *
 * Displays recent team expenses with user info.
 */
"use client";

import { useState, useEffect } from "react";
import { Receipt, Loader2 } from "lucide-react";

// Simple relative date formatter
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

interface TeamExpense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: string;
  addedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TeamExpensesListProps {
  teamId: string;
  limit?: number;
}

export function TeamExpensesList({ teamId, limit = 5 }: TeamExpensesListProps) {
  const [expenses, setExpenses] = useState<TeamExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/expenses?limit=${limit}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setExpenses(res.data.expenses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId, limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
        <Receipt className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No expenses yet</p>
        <p className="text-xs text-muted-foreground">
          Team expenses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{expense.category}</p>
              {expense.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {expense.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                by {expense.addedBy.name ?? expense.addedBy.email} •{" "}
                {formatRelativeDate(expense.date)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-red-600">
              -{expense.currency} {expense.amount.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
