/**
 * components/ReportsClient.tsx
 *
 * Reports page with Recharts and green design system.
 */
"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNPR } from "@/lib/currency";
import type { MonthlyData, CategoryData, BudgetRow } from "@/types";
import { Download, FileText, Loader2, BarChart3 } from "lucide-react";
import { SpendingHeatmap } from "@/components/charts/SpendingHeatmap";
import { BudgetVsActual } from "@/components/charts/BudgetVsActual";
import { ComparativeChart } from "@/components/charts/ComparativeChart";

interface DailyData {
  date: string;
  total: number;
}

interface ComparisonData {
  category: string;
  thisMonth: number;
  lastMonth: number;
}

interface ReportsClientProps {
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
  dailyData?: DailyData[];
  budgets?: BudgetRow[];
  spendingByCategory?: Record<string, number>;
  totalMonthSpend?: number;
  daysInMonth?: number;
  dayOfMonth?: number;
  comparisonData?: ComparisonData[];
}

const COLORS = [
  "#22c55e", "#4ade80", "#86efac", "#16a34a", "#bbf7d0",
  "#15803d", "#dcfce7", "#10b981", "#059669", "#047857",
];

const TICK_STYLE = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--popover))",
    borderColor: "hsl(var(--border))",
    borderRadius: 12,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  labelStyle: {
    color: "hsl(var(--foreground))",
    fontWeight: 600,
  },
};

export function ReportsClient({
  monthlyData,
  categoryData,
  dailyData,
  budgets,
  spendingByCategory,
  totalMonthSpend,
  daysInMonth,
  dayOfMonth,
  comparisonData,
}: ReportsClientProps) {
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);

  async function handleExport(format: "csv" | "pdf") {
    setDownloading(format);
    try {
      const res = await fetch(`/api/reports/export?format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trackr-expenses.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  if (monthlyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mb-4">
          <BarChart3 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground">No data yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add some expenses to see your reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Export Buttons */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Export:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("csv")}
          disabled={!!downloading}
        >
          {downloading === "csv" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("pdf")}
          disabled={!!downloading}
        >
          {downloading === "pdf" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          PDF
        </Button>
      </div>

      {/* Monthly Bar Chart */}
      <Card className="border-green-200/50 dark:border-green-800/30">
        <CardHeader>
          <CardTitle className="font-heading">Monthly Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={TICK_STYLE}
                tickFormatter={(value: string) => {
                  const [year, month] = value.split("-");
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleDateString("en-US", { month: "short" });
                }}
              />
              <YAxis
                tick={TICK_STYLE}
                tickFormatter={(value: number) => `NPR ${value.toLocaleString()}`}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number) => [formatNPR(value), "Total"]}
                labelFormatter={(label: string) => {
                  const [year, month] = label.split("-");
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                }}
              />
              <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Category Pie Chart */}
        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardHeader>
            <CardTitle className="font-heading">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="total"
                  nameKey="category"
                  label={({ category, percent }: { category: string; percent: number }) =>
                    `${category} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(value: number) => [formatNPR(value), "Total"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Line */}
        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardHeader>
            <CardTitle className="font-heading">Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={TICK_STYLE}
                  tickFormatter={(value: string) => {
                    const [year, month] = value.split("-");
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString("en-US", { month: "short" });
                  }}
                />
                <YAxis
                  tick={TICK_STYLE}
                  tickFormatter={(value: number) => `NPR ${value.toLocaleString()}`}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(value: number) => [formatNPR(value), "Total"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: "#22c55e", r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#16a34a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Spending Heatmap */}
      {dailyData && dailyData.length > 0 && (
        <SpendingHeatmap dailyData={dailyData} />
      )}

      {/* Budget vs Actual */}
      {budgets && budgets.length > 0 && spendingByCategory && (
        <BudgetVsActual
          budgets={budgets}
          spendingByCategory={spendingByCategory}
          totalMonthSpend={totalMonthSpend ?? 0}
          daysInMonth={daysInMonth ?? 30}
          dayOfMonth={dayOfMonth ?? 1}
        />
      )}

      {/* Comparative Chart */}
      {comparisonData && comparisonData.length > 0 && (
        <ComparativeChart data={comparisonData} />
      )}
    </div>
  );
}
