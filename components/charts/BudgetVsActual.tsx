/**
 * components/charts/BudgetVsActual.tsx
 *
 * Horizontal bar chart comparing budget vs actual spending per budget.
 * Shows green for under-budget, red for over-budget, with projected
 * end-of-month indicator.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { BudgetRow } from "@/types";

interface BudgetVsActualProps {
  budgets: BudgetRow[];
  spendingByCategory: Record<string, number>;
  totalMonthSpend: number;
  daysInMonth: number;
  dayOfMonth: number;
}

export function BudgetVsActual({
  budgets,
  spendingByCategory,
  totalMonthSpend,
  daysInMonth,
  dayOfMonth,
}: BudgetVsActualProps) {
  if (budgets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {budgets.map((budget) => {
          const spent = budget.category
            ? (spendingByCategory[budget.category] ?? 0)
            : totalMonthSpend;
          const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const isOver = pct > 100;

          // Project month-end based on daily pace
          const dailyRate = dayOfMonth > 0 ? spent / dayOfMonth : 0;
          const projected = dailyRate * daysInMonth;
          const projectedPct = budget.amount > 0 ? (projected / budget.amount) * 100 : 0;

          return (
            <div key={budget.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">
                  {budget.name}
                  {budget.category && (
                    <span className="ml-1 text-muted-foreground">
                      ({budget.category})
                    </span>
                  )}
                </span>
                <span className={isOver ? "font-bold text-red-500" : "text-muted-foreground"}>
                  {formatCurrency(spent, "NPR")} / {formatCurrency(budget.amount, "NPR")}
                </span>
              </div>

              {/* Progress bar with projected indicator */}
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                {/* Actual */}
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                    isOver ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
                {/* Projected marker */}
                {projectedPct > 0 && projectedPct <= 150 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/50"
                    style={{ left: `${Math.min(projectedPct, 100)}%` }}
                    title={`Projected: ${formatCurrency(projected, "NPR")}`}
                  />
                )}
              </div>

              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(pct)}% spent</span>
                <span>
                  Projected: {formatCurrency(projected, "NPR")}
                  {projectedPct > 100 && (
                    <span className="ml-1 text-red-500">
                      ({formatCurrency(projected - budget.amount, "NPR")} over)
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
