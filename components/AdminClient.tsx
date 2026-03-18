/**
 * components/AdminClient.tsx
 *
 * Admin dashboard with green design system styling.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNPR } from "@/lib/currency";
import type { AdminUserRow } from "@/types";
import {
  Users,
  Crown,
  DollarSign,
  TrendingDown,
  Loader2,
  Shield,
} from "lucide-react";

interface AdminClientProps {
  users: AdminUserRow[];
  stats: {
    totalUsers: number;
    proUsersCount: number;
    monthlyMRR: number;
  };
}

const churnData = [
  { month: "Sep", rate: 4.2 },
  { month: "Oct", rate: 3.8 },
  { month: "Nov", rate: 5.1 },
  { month: "Dec", rate: 3.2 },
  { month: "Jan", rate: 2.9 },
  { month: "Feb", rate: 3.5 },
];

export function AdminClient({ users, stats }: AdminClientProps) {
  const router = useRouter();
  const [overriding, setOverriding] = useState<string | null>(null);

  async function handlePlanOverride(userId: string, plan: string) {
    setOverriding(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to update plan");
        return;
      }

      toast.success(`Plan updated to ${plan}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setOverriding(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground font-body">
            Manage users and monitor business metrics.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group animate-fade-up-delay-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-heading text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="stat-icon-box bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold text-foreground">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="group animate-fade-up-delay-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-heading text-sm font-medium text-muted-foreground">
              Pro Users
            </CardTitle>
            <div className="stat-icon-box bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <Crown className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold text-foreground">{stats.proUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0
                ? ((stats.proUsersCount / stats.totalUsers) * 100).toFixed(1)
                : 0}
              % conversion
            </p>
          </CardContent>
        </Card>

        <Card className="group animate-fade-up-delay-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-heading text-sm font-medium text-muted-foreground">
              Monthly MRR
            </CardTitle>
            <div className="stat-icon-box bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold text-green-600 dark:text-green-400">
              {formatNPR(stats.monthlyMRR)}
            </div>
          </CardContent>
        </Card>

        <Card className="group animate-fade-up-delay-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-heading text-sm font-medium text-muted-foreground">
              Churn Rate
            </CardTitle>
            <div className="stat-icon-box bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold text-foreground">
              {churnData[churnData.length - 1].rate}%
            </div>
            <p className="text-xs text-muted-foreground">last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Churn chart */}
      <Card className="animate-fade-up-delay-5">
        <CardHeader>
          <CardTitle className="font-heading">Churn Rate Trend (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-4">
            {churnData.map((d, i) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-1 row-animate" style={{ '--row-index': i } as React.CSSProperties}>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-red-500 to-red-400 transition-all duration-300 hover:from-red-600 hover:to-red-500 hover:scale-105 animate-bar-grow"
                  style={{ height: `${d.rate * 20}px`, animationDelay: `${0.5 + i * 0.1}s` }}
                />
                <span className="text-xs text-muted-foreground">{d.month}</span>
                <span className="text-xs font-semibold text-foreground">{d.rate}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User table */}
      <Card className="fade-in" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="font-heading">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-green-200/50 dark:border-green-800/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-200/50 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/10">
                    <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Plan
                    </th>
                    <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Expenses
                    </th>
                    <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Joined
                    </th>
                    <th className="px-4 py-4 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Override
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr
                      key={u.id}
                      className="border-b border-green-200/30 dark:border-green-800/20 last:border-0 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-colors row-animate"
                      style={{ '--row-index': index } as React.CSSProperties}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-xs font-semibold text-white shadow-sm">
                            {u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={u.plan === "PRO" ? "pro" : u.plan === "ENTERPRISE" ? "pro" : "secondary"}>
                          {u.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-medium text-foreground">{u._count.expenses}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={u.plan}
                            onValueChange={(plan) => handlePlanOverride(u.id, plan)}
                            disabled={overriding === u.id}
                          >
                            <SelectTrigger className="h-9 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FREE">FREE</SelectItem>
                              <SelectItem value="PRO">PRO</SelectItem>
                              <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
                            </SelectContent>
                          </Select>
                          {overriding === u.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
