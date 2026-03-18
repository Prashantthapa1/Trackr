/**
 * app/(dashboard)/teams/[teamId]/activity/page.tsx
 *
 * Full team activity log page.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";

export default async function TeamActivityPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const user = await requireAuth();
  const { teamId } = await params;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
    include: { team: { select: { name: true } } },
  });

  if (!membership) redirect("/teams");

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${teamId}`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-muted-foreground">{membership.team.name}</p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeamActivityFeed teamId={teamId} />
        </CardContent>
      </Card>
    </div>
  );
}
