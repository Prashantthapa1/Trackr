/**
 * components/team/TeamExpenseTable.tsx
 *
 * Table showing expenses within a team workspace.
 */
"use client";

import { useState, useEffect } from "react";
import { Receipt, User, Tag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface TeamExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  addedByName: string | null;
  addedByEmail: string;
  approvalStatus: string | null;
}

export function TeamExpenseTable({ teamId }: { teamId: string }) {
  const [expenses, setExpenses] = useState<TeamExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/expenses`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setExpenses(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
        <Receipt className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No team expenses yet</p>
        <p className="text-xs text-muted-foreground">
          Team members can add expenses to track shared spending.
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Description
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Amount
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
              Category
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
              Added By
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
              Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr
              key={exp.id}
              className="border-b border-border/30 transition hover:bg-muted/20"
            >
              <td className="px-4 py-3 font-medium">{exp.description}</td>
              <td className="px-4 py-3 font-semibold tabular-nums">
                ${exp.amount.toFixed(2)}
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  {exp.category || "Uncategorized"}
                </span>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {exp.addedByName || exp.addedByEmail}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                {formatDate(exp.date)}
              </td>
              <td className="px-4 py-3">
                {exp.approvalStatus ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      statusColors[exp.approvalStatus] || ""
                    )}
                  >
                    {exp.approvalStatus}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
