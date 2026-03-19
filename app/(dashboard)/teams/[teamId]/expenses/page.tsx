/**
 * app/(dashboard)/teams/[teamId]/expenses/page.tsx
 *
 * Team expenses list page with add/edit/delete functionality.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamExpensesClient } from "@/components/team/TeamExpensesClient";

export default async function TeamExpensesPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const user = await requireAuth();
  const { teamId } = await params;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
    include: {
      team: { select: { name: true } },
    },
  });

  if (!membership) {
    redirect("/teams");
  }

  const canAddExpense = membership.role !== "VIEWER";

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/teams/${teamId}`}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Team Expenses</h1>
            <p className="text-muted-foreground">{membership.team.name}</p>
          </div>
        </div>
        {canAddExpense && (
          <Link href={`/teams/${teamId}/expenses/new`}>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        )}
      </div>

      <TeamExpensesClient teamId={teamId} canEdit={canAddExpense} />
    </div>
  );
}
