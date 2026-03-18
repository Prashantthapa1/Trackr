/**
 * app/(dashboard)/teams/page.tsx
 *
 * Teams list page — shows all teams user owns or belongs to,
 * plus pending invitations. PRO-gated.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ProGate } from "@/components/ProGate";
import Link from "next/link";
import {
  Users,
  Plus,
  Crown,
  Shield,
  ChevronRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function TeamsPage() {
  const user = await requireAuth();

  if (user.plan === "FREE") {
    return (
      <ProGate
        title="Team Workspaces"
        description="Create team workspaces, invite collaborators, and track shared expenses together with role-based access control."
      />
    );
  }

  const [teams, invitations] = await Promise.all([
    prisma.teamMember.findMany({
      where: { userId: user.id },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.teamInvitation.findMany({
      where: {
        email: user.email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        team: { select: { name: true } },
        inviter: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage your team workspaces and collaborations.
          </p>
        </div>
        <Link href="/teams/new">
          <Button className="gap-2 rounded-xl shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            New Team
          </Button>
        </Link>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-5 w-5 text-primary" />
            Pending Invitations
            <Badge className="bg-primary/10 text-primary">{invitations.length}</Badge>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {invitations.map((inv) => (
              <Link
                key={inv.id}
                href={`/teams/invitations`}
                className="group flex items-center justify-between rounded-2xl border border-border/50 bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{inv.team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {inv.inviter.name ?? inv.inviter.email} as {inv.role}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Team List */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No teams yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first team to start collaborating.
            </p>
          </div>
          <Link href="/teams/new">
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((tm) => {
            const isOwner = tm.team.ownerId === user.id;
            return (
              <Link
                key={tm.id}
                href={`/teams/${tm.team.id}`}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Crown className="h-3 w-3" /> Owner
                      </span>
                    )}
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      <Shield className="h-3 w-3" /> {tm.role}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold">{tm.team.name}</h3>
                {tm.team.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {tm.team.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {tm.team._count.members} member{tm.team._count.members !== 1 ? "s" : ""}
                  </span>
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
