/**
 * components/team/TeamBudgetForm.tsx
 *
 * Form for creating team budgets.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Target } from "lucide-react";

interface TeamBudgetFormProps {
  teamId: string;
}

const CATEGORIES = [
  "All Categories",
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Office Supplies",
  "Software & Tools",
  "Marketing",
  "Other",
];

export function TeamBudgetForm({ teamId }: TeamBudgetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [category, setCategory] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/teams/${teamId}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          period,
          category: category === "All Categories" ? undefined : category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to create budget");
        return;
      }

      toast.success("Budget created!");
      router.push(`/teams/${teamId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Budget Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Budget Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Monthly Office Expenses"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Budget Amount (NPR)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm font-medium">
                Period
              </Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="rounded-xl">
                  <SelectValue placeholder="All Categories (track total spending)" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Leave as "All Categories" to track total team spending, or select a specific category.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name || !amount}
              className="rounded-xl"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Target className="mr-2 h-4 w-4" />
              )}
              Create Budget
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
