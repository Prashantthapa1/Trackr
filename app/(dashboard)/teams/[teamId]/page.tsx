/**
 * app/(dashboard)/teams/[teamId]/page.tsx
 *
 * Team dashboard — overview with stats, recent activity, expenses, budgets.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Activity,
  Target,
  Settings,
  UserPlus,
  ChevronRight,
  Receipt,
  Crown,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";
import { TeamBudgetDashboard } from "@/components/team/TeamBudgetDashboard";
import { TeamExpensesList } from "@/components/team/TeamExpensesList";
import { TeamCharts } from "@/components/team/TeamCharts";

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const user = await requireAuth();
  const { teamId } = await params;

  // Verify membership
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
    include: {
      team: {
        include: {
          _count: { select: { members: true, expenses: true, budgets: true } },
          owner: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!membership) {
    redirect("/teams");
  }

  const team = membership.team;
  const isAdmin = membership.role === "ADMIN";
  const canAddExpense = membership.role !== "VIEWER";

  // Get this month's spending
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthExpenses = await prisma.expense.findMany({
    where: { teamId, date: { gte: monthStart } },
    include: { user: { select: { name: true, email: true } } },
  });

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseCount = currentMonthExpenses.length;

  // Get recent members
  const recentMembers = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: { joinedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <Badge className="bg-primary/10 text-primary">{membership.role}</Badge>
          </div>
          {team.description && (
            <p className="mt-1 text-muted-foreground">{team.description}</p>
          )}
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            Owned by {team.owner.name ?? team.owner.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAddExpense && (
            <Link href={`/teams/${teamId}/expenses/new`}>
              <Button className="gap-2 rounded-xl shadow-lg shadow-primary/25">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </Link>
          )}
          <Link href={`/teams/${teamId}/expenses`}>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Receipt className="h-4 w-4" />
              View Expenses
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/teams/${teamId}/members`}>
              <Button variant="outline" className="gap-2 rounded-xl">
                <UserPlus className="h-4 w-4" />
                Members
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link href={`/teams/${teamId}/settings`}>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
                <DollarSign className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Team spending</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                <Receipt className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Expenses</p>
            <p className="text-2xl font-bold">{expenseCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/20">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Members</p>
            <p className="text-2xl font-bold">{team._count.members}</p>
            <p className="mt-1 text-xs text-muted-foreground">collaborators</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Budgets</p>
            <p className="text-2xl font-bold">{team._count.budgets}</p>
            <p className="mt-1 text-xs text-muted-foreground">active budgets</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {currentMonthExpenses.length > 0 && (
        <TeamCharts expenses={currentMonthExpenses} />
      )}

      {/* Two columns: Activity + Budgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <Link
              href={`/teams/${teamId}/activity`}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            <TeamActivityFeed teamId={teamId} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Budget Progress
            </CardTitle>
            {isAdmin && (
              <Link href={`/teams/${teamId}/budgets/new`}>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                  <Plus className="h-3.5 w-3.5" />
                  Add Budget
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <TeamBudgetDashboard teamId={teamId} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Team Expenses */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Recent Expenses
          </CardTitle>
          <Link
            href={`/teams/${teamId}/expenses`}
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          <TeamExpensesList teamId={teamId} limit={5} />
        </CardContent>
      </Card>

      {/* Team Members Preview */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Members
          </CardTitle>
          <Link
            href={`/teams/${teamId}/members`}
            className="text-sm text-primary hover:underline"
          >
            Manage →
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {recentMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5 text-xs font-semibold text-primary">
                  {m.user.name?.[0]?.toUpperCase() ??
                    m.user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.user.name ?? m.user.email}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
