/**
 * components/TeamClient.tsx
 *
 * Team member management with green design system.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { TeamMemberRow } from "@/types";
import { Loader2, UserPlus, Trash2, Users, Shield } from "lucide-react";

interface TeamClientProps {
  members: TeamMemberRow[];
  maxMembers: number;
}

export function TeamClient({ members, maxMembers }: TeamClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    if (members.length >= maxMembers) {
      toast.error(`Team limit reached (${maxMembers} members max)`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to invite member");
        return;
      }

      toast.success(`Invited ${email} as ${role}`);
      setEmail("");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(memberId: string) {
    setRemovingId(memberId);

    try {
      const res = await fetch(`/api/team?id=${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to remove member");
        return;
      }

      toast.success("Member removed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <Card className="border-green-200/50 dark:border-green-800/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <UserPlus className="h-5 w-5 text-green-500" />
            Invite Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-40 space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Invite
              </Button>
            </div>
          </form>
          <p className="mt-3 text-sm text-muted-foreground">
            {members.length} / {maxMembers} members
          </p>
        </CardContent>
      </Card>

      {/* Members list */}
      <Card className="border-green-200/50 dark:border-green-800/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Users className="h-5 w-5 text-green-500" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mb-4">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-muted-foreground">No team members yet. Invite someone above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-green-200/50 dark:border-green-800/30 p-4 transition-colors hover:bg-green-50/50 dark:hover:bg-green-900/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-sm font-semibold text-white">
                      {member.name?.[0]?.toUpperCase() ?? member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.name ?? member.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === "member" ? "default" : "secondary"}>
                      <Shield className="mr-1 h-3 w-3" />
                      {member.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                      onClick={() => handleRemove(member.id)}
                      disabled={removingId === member.id}
                    >
                      {removingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
