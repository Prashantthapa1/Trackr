/**
 * components/ExpenseForm.tsx
 *
 * Client Component for adding a new expense.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { UpgradeModal } from "@/components/UpgradeModal";
import type { UsageInfo } from "@/types";
import { FileImage, Loader2, Plus, X } from "lucide-react";

interface ExpenseFormProps {
  categories: string[];
  plan: string;
  usage: UsageInfo;
  budgetId?: string;
}

export function ExpenseForm({ categories, plan, usage, budgetId }: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (plan === "FREE" && usage.count >= usage.limit) {
      toast.error(`You've reached your free limit of ${usage.limit} expenses this month!`);
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    try {
      let receiptUrl: string | undefined;
      if (receipt) {
        setUploadingReceipt(true);
        const uploadData = new FormData();
        uploadData.append("file", receipt);
        const uploadRes = await fetch("/api/receipts/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          toast.error(uploadJson.error ?? "Failed to upload receipt");
          return;
        }
        receiptUrl = uploadJson.data.url;
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: "NPR",
          category,
          description: description || undefined,
          date,
          receiptUrl,
          budgetId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          toast.error("You've reached your free limit!");
          setShowUpgrade(true);
        } else {
          toast.error(data.error ?? "Failed to add expense");
        }
        return;
      }

      toast.success("Expense added!");

      if (plan === "FREE" && usage.count + 1 >= usage.limit) {
        toast.warning(`You've reached your monthly limit of ${usage.limit} expenses!`);
        setShowUpgrade(true);
      }

      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setReceipt(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUploadingReceipt(false);
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount (NPR)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-4">
            <Label htmlFor="receipt">Receipt screenshot (optional)</Label>
            {plan === "FREE" ? (
              <p className="text-sm text-muted-foreground">Receipt uploads are available on Pro.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(event) => setReceipt(event.target.files?.[0] ?? null)}
                  disabled={loading}
                  className="max-w-md"
                />
                {receipt && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileImage className="h-4 w-4" />
                    {receipt.name}
                    <button
                      type="button"
                      aria-label="Remove receipt"
                      onClick={() => setReceipt(null)}
                      disabled={loading}
                      className="rounded p-1 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Lunch at cafe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading || uploadingReceipt || !category} size="lg">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {uploadingReceipt ? "Uploading receipt..." : "Add Expense"}
        </Button>
      </form>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
}
