/**
 * app/(dashboard)/teams/[teamId]/expenses/new/page.tsx
 *
 * Add new team expense page.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamExpenseForm } from "@/components/team/TeamExpenseForm";

const DEFAULT_CATEGORIES = [
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

export default async function NewTeamExpensePage({
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

  if (membership.role === "VIEWER") {
    redirect(`/teams/${teamId}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${teamId}/expenses`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Team Expense</h1>
          <p className="text-muted-foreground">{membership.team.name}</p>
        </div>
      </div>

      <TeamExpenseForm teamId={teamId} categories={DEFAULT_CATEGORIES} />
    </div>
  );
}
