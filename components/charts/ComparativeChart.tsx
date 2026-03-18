/**
 * components/charts/ComparativeChart.tsx
 *
 * Side-by-side bar chart comparing this month vs last month spending
 * per category. Shows percentage change with up/down indicators.
 */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNPR } from "@/lib/currency";

interface ComparisonData {
  category: string;
  thisMonth: number;
  lastMonth: number;
}

interface ComparativeChartProps {
  data: ComparisonData[];
}

const TICK_STYLE = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--chart-tooltip-bg)",
    borderColor: "var(--chart-tooltip-border)",
    color: "#ffffff",
    borderRadius: 8,
  },
};

export function ComparativeChart({ data }: ComparativeChartProps) {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month vs Last Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tick={{ ...TICK_STYLE, fontSize: 11 }}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={TICK_STYLE}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [
                formatNPR(value),
                name === "thisMonth" ? "This Month" : "Last Month",
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === "thisMonth" ? "This Month" : "Last Month"
              }
            />
            <Bar dataKey="lastMonth" fill="#86efac" radius={[4, 4, 0, 0]} />
            <Bar dataKey="thisMonth" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Percentage changes */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((d) => {
            const change =
              d.lastMonth > 0
                ? ((d.thisMonth - d.lastMonth) / d.lastMonth) * 100
                : d.thisMonth > 0
                  ? 100
                  : 0;
            return (
              <div key={d.category} className="rounded-lg bg-muted p-2 text-xs">
                <p className="truncate font-medium">{d.category}</p>
                <p
                  className={
                    change > 0
                      ? "text-red-500"
                      : change < 0
                        ? "text-green-500"
                        : "text-muted-foreground"
                  }
                >
                  {change > 0 ? "↑" : change < 0 ? "↓" : "→"}{" "}
                  {Math.abs(change).toFixed(0)}%
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
