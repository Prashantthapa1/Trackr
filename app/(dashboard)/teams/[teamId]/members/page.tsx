/**
 * app/(dashboard)/teams/[teamId]/members/page.tsx
 *
 * Team member management page — invite, view, change roles, remove members.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberList } from "@/components/team/MemberList";
import { TeamMembersClient } from "./client";

export default async function TeamMembersPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const user = await requireAuth();
  const { teamId } = await params;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
    include: {
      team: { select: { name: true, ownerId: true } },
    },
  });

  if (!membership) redirect("/teams");

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: { select: { id: true, email: true, name: true, image: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  const serialized = members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    email: m.user.email,
    name: m.user.name,
    image: m.user.image,
    role: m.role,
    joinedAt: m.joinedAt.toISOString(),
  }));

  // Get pending invitations if admin
  let pendingInvites: { id: string; email: string; role: string; createdAt: string }[] = [];
  if (membership.role === "ADMIN") {
    const invites = await prisma.teamInvitation.findMany({
      where: { teamId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    pendingInvites = invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      createdAt: i.createdAt.toISOString(),
    }));
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${teamId}`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">{membership.team.name}</p>
        </div>
      </div>

      <TeamMembersClient
        teamId={teamId}
        myRole={membership.role}
      />

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Members ({serialized.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemberList
            teamId={teamId}
            members={serialized}
            ownerId={membership.team.ownerId}
            currentUserId={user.id}
            myRole={membership.role}
          />
        </CardContent>
      </Card>

      {/* Pending invitations */}
      {pendingInvites.length > 0 && (
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Invited as {inv.role}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Pending
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
