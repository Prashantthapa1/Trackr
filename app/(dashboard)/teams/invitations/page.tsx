/**
 * app/(dashboard)/teams/invitations/page.tsx
 *
 * Pending invitations page — accept or decline team invitations.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Invitation {
  id: string;
  teamId: string;
  teamName: string;
  invitedByName: string | null;
  invitedByEmail: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teams/invitations")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setInvitations(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(invitationId: string, action: "accept" | "decline") {
    setActionId(invitationId);
    try {
      const res = await fetch(`/api/teams/invitations/${invitationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? `Failed to ${action} invitation`);
        return;
      }
      toast.success(
        action === "accept"
          ? "You've joined the team!"
          : "Invitation declined"
      );
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      if (action === "accept") {
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="w-full space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link href="/teams">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground">
            Review and respond to team invitations.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No pending invitations</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;ll see invitations here when someone invites you to their team.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <Card key={inv.id} className="rounded-2xl border-border/50">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{inv.teamName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {inv.invitedByName ?? inv.invitedByEmail} invited you as{" "}
                      <span className="font-semibold text-foreground">{inv.role}</span>
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Expires{" "}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="gap-1.5 rounded-xl"
                    onClick={() => handleAction(inv.id, "accept")}
                    disabled={actionId === inv.id}
                  >
                    {actionId === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1.5 rounded-xl"
                    onClick={() => handleAction(inv.id, "decline")}
                    disabled={actionId === inv.id}
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
