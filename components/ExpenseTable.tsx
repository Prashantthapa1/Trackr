/**
 * components/ExpenseTable.tsx
 *
 * Expense list with sortable columns, search, filter, inline edit, and delete.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { EXPENSE_CATEGORIES } from "@/types";
import type { ExpenseRow } from "@/types";
import { ArrowUpDown, Trash2, FileImage, Loader2, Pencil, Search, Receipt } from "lucide-react";

interface ExpenseTableProps {
  expenses: ExpenseRow[];
  plan: string;
}

type SortField = "date" | "amount" | "category";
type SortDir = "asc" | "desc";

export function ExpenseTable({ expenses, plan }: ExpenseTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Edit state
  const [editExpense, setEditExpense] = useState<ExpenseRow | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function openEdit(expense: ExpenseRow) {
    setEditExpense(expense);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditDescription(expense.description ?? "");
    setEditDate(expense.date.split("T")[0]);
  }

  async function handleSaveEdit() {
    if (!editExpense) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${editExpense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(editAmount),
          category: editCategory,
          description: editDescription || undefined,
          date: editDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to update expense");
        return;
      }
      toast.success("Expense updated!");
      setEditExpense(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      (e.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(e.amount).includes(searchQuery);
    const matchesCategory =
      filterCategory === "all" || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "date":
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
      case "amount":
        return (a.amount - b.amount) * dir;
      case "category":
        return a.category.localeCompare(b.category) * dir;
      default:
        return 0;
    }
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete expense");
        return;
      }
      toast.success("Expense deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
          <Receipt className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">No expenses yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first expense using the form above.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Search & Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || filterCategory !== "all") && (
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            Showing {sorted.length} of {expenses.length}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-green-200/50 bg-white/80 backdrop-blur-sm dark:border-green-800/30 dark:bg-zinc-900/80">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-200/50 bg-green-50/50 dark:border-green-800/30 dark:bg-green-900/10">
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => toggleSort("date")}
                    className="flex items-center gap-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => toggleSort("category")}
                    className="flex items-center gap-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Category <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => toggleSort("amount")}
                    className="flex items-center gap-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Amount <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                {plan !== "FREE" && (
                  <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Receipt
                  </th>
                )}
                <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b border-green-200/30 last:border-0 hover:bg-green-50/30 dark:border-green-800/20 dark:hover:bg-green-900/10 transition-colors"
                >
                  <td className="px-4 py-4 font-body text-foreground">
                    {new Date(expense.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="expense">{expense.category}</Badge>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground max-w-48 truncate">
                    {expense.description ?? "—"}
                  </td>
                  <td className="px-4 py-4 font-heading font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(expense.amount, "NPR")}
                  </td>
                  {plan !== "FREE" && (
                    <td className="px-4 py-4">
                      {expense.receiptUrl ? (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        >
                          <FileImage className="h-4 w-4" /> View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(expense)}
                        className="h-8 w-8 text-muted-foreground hover:text-green-600 dark:hover:text-green-400"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        {deletingId === expense.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editExpense} onOpenChange={(open) => !open && setEditExpense(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (NPR)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditExpense(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
