/**
 * app/(dashboard)/teams/[teamId]/budgets/new/page.tsx
 *
 * Add new team budget page (admin only).
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamBudgetForm } from "@/components/team/TeamBudgetForm";

export default async function NewTeamBudgetPage({
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

  // Only admins can create budgets
  if (membership.role !== "ADMIN") {
    redirect(`/teams/${teamId}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${teamId}`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Team Budget</h1>
          <p className="text-muted-foreground">{membership.team.name}</p>
        </div>
      </div>

      <TeamBudgetForm teamId={teamId} />
    </div>
  );
}
