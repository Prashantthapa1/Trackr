"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";

const COLORS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#eab308", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
];

export function TeamCharts({ expenses }: { expenses: any[] }) {
  if (!expenses || expenses.length === 0) return null;

  // Aggregate by Category
  const byCategory = expenses.reduce((acc: any, curr: any) => {
    const cat = curr.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  const categoryData = Object.keys(byCategory)
    .map(key => ({ name: key, value: byCategory[key] }))
    .sort((a, b) => b.value - a.value);

  // Aggregate by Member
  const byMember = expenses.reduce((acc: any, curr: any) => {
    const name = curr.user?.name || curr.user?.email || curr.addedBy?.name || "Unknown Member";
    acc[name] = (acc[name] || 0) + curr.amount;
    return acc;
  }, {});

  const memberData = Object.keys(byMember)
    .map(key => ({ name: key, value: byMember[key] }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="grid gap-6 lg:grid-cols-2 fade-in">
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => formatCurrency(value, "NPR")} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Spending by Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${val}`} 
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatCurrency(value, "NPR"), "Spent"]}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
