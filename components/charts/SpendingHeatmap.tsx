/**
 * components/charts/SpendingHeatmap.tsx
 *
 * GitHub-contributions-style heatmap showing daily spending intensity.
 * Color intensity represents amount spent on each day. Click a day to
 * see the total. Shows the last 12 weeks (84 days).
 */
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface DailyData {
  date: string; // "YYYY-MM-DD"
  total: number;
}

interface SpendingHeatmapProps {
  dailyData: DailyData[];
}

const WEEKS = 12;
const DAYS = WEEKS * 7;

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensity(amount: number, max: number): number {
  if (amount === 0 || max === 0) return 0;
  const ratio = amount / max;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

const INTENSITY_COLORS = [
  "bg-muted",             // 0 - no spending
  "bg-green-200 dark:bg-green-900",   // 1
  "bg-green-400 dark:bg-green-700",   // 2
  "bg-green-600 dark:bg-green-500",   // 3
  "bg-green-800 dark:bg-green-300",   // 4
];

export function SpendingHeatmap({ dailyData }: SpendingHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<DailyData | null>(null);

  const { grid, maxAmount, monthLabels } = useMemo(() => {
    const dataMap = new Map(dailyData.map((d) => [d.date, d.total]));
    const today = new Date();
    const cells: { date: string; total: number; dayOfWeek: number }[] = [];
    let max = 0;

    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const total = dataMap.get(key) ?? 0;
      if (total > max) max = total;
      cells.push({ date: key, total, dayOfWeek: d.getDay() });
    }

    // Group into weeks (columns)
    const weeks: typeof cells[] = [];
    let currentWeek: typeof cells = [];
    for (const cell of cells) {
      currentWeek.push(cell);
      if (cell.dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Month labels
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, colIdx) => {
      const firstDay = new Date(week[0].date);
      const m = firstDay.getMonth();
      if (m !== lastMonth) {
        labels.push({
          label: firstDay.toLocaleDateString("en-US", { month: "short" }),
          col: colIdx,
        });
        lastMonth = m;
      }
    });

    return { grid: weeks, maxAmount: max, monthLabels: labels };
  }, [dailyData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Spending Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="mb-1 flex pl-8">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground"
                style={{
                  position: "relative",
                  left: `${m.col * 16}px`,
                  marginRight: i < monthLabels.length - 1 ? "0" : undefined,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 pr-1">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="flex h-3 w-6 items-center justify-end text-[10px] text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid */}
            {grid.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-0.5">
                {week.map((cell) => {
                  const intensity = getIntensity(cell.total, maxAmount);
                  return (
                    <button
                      key={cell.date}
                      className={`h-3 w-3 rounded-sm transition-colors ${INTENSITY_COLORS[intensity]} hover:ring-1 hover:ring-foreground`}
                      title={`${cell.date}: ${formatCurrency(cell.total, "NPR")}`}
                      onClick={() =>
                        setSelectedDay(
                          selectedDay?.date === cell.date ? null : cell
                        )
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            {INTENSITY_COLORS.map((cls, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-sm ${cls}`}
              />
            ))}
            <span>More</span>
          </div>

          {/* Selected day info */}
          {selectedDay && (
            <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
              <span className="font-medium">{selectedDay.date}</span>:{" "}
              <span className="font-bold">
                {formatCurrency(selectedDay.total, "NPR")}
              </span>{" "}
              spent
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
