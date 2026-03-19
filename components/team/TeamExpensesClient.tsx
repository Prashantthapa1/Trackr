/**
 * components/team/TeamExpensesClient.tsx
 *
 * Full team expenses list with pagination and delete functionality.
 */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Receipt, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  receiptUrl: string | null;
  addedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TeamExpensesClientProps {
  teamId: string;
  canEdit: boolean;
}

export function TeamExpensesClient({ teamId, canEdit }: TeamExpensesClientProps) {
  const [expenses, setExpenses] = useState<TeamExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExpenses = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/expenses?page=${p}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data.expenses);
        setTotalPages(data.data.pages);
      }
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(page);
  }, [teamId, page]);

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return;
    setDeletingId(expenseId);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Receipt className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No expenses yet</h3>
          <p className="text-sm text-muted-foreground">
            {canEdit ? "Add your first team expense to get started." : "Team expenses will appear here."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Added By</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
              {canEdit && <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {expense.description || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {expense.addedBy.name ?? expense.addedBy.email}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatRelativeDate(expense.date)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-600">
                  -{expense.currency} {expense.amount.toLocaleString()}
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                    >
                      {deletingId === expense.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
