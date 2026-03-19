/**
 * components/team/TeamBudgetDashboard.tsx
 *
 * Team budget progress bars with spending stats.
 */
"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamBudget {
  id: string;
  name: string;
  amount: number;
  period: string;
  categoryId: string | null;
  categoryName: string | null;
  spent: number;
}

export function TeamBudgetDashboard({ teamId }: { teamId: string }) {
  const [budgets, setBudgets] = useState<TeamBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/budgets`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBudgets(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl bg-muted p-4">
            <div className="mb-2 h-3 w-1/3 rounded bg-muted-foreground/10" />
            <div className="h-2 w-full rounded bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
        <Target className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No team budgets yet</p>
        <p className="text-xs text-muted-foreground">
          Set budgets to track team spending limits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgets.map((budget) => {
        const amount = budget.amount || 0;
        const spent = budget.spent || 0;
        const pct = amount > 0 ? (spent / amount) * 100 : 0;
        const isOver = pct >= 100;
        const isWarning = pct >= 80 && pct < 100;

        return (
          <div
            key={budget.id}
            className="rounded-xl border border-border/50 bg-card p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{budget.name}</p>
                {budget.categoryName && (
                  <p className="text-xs text-muted-foreground">
                    Category: {budget.categoryName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {isOver ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : isWarning ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-bold",
                    isOver
                      ? "text-red-500"
                      : isWarning
                      ? "text-amber-500"
                      : "text-green-500"
                  )}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isOver
                    ? "bg-red-500"
                    : isWarning
                    ? "bg-amber-500"
                    : "bg-green-500"
                )}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>${(budget.spent || 0).toFixed(2)} spent</span>
              <span>${(budget.amount || 0).toFixed(2)} budget</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
