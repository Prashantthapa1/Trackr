/**
 * components/team/MemberList.tsx
 *
 * Table with role badges and actions for team member management.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  UserMinus,
  Loader2,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  joinedAt: string;
}

interface MemberListProps {
  teamId: string;
  members: Member[];
  ownerId: string;
  currentUserId: string;
  myRole: string;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MEMBER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  VIEWER: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function MemberList({
  teamId,
  members,
  ownerId,
  currentUserId,
  myRole,
}: MemberListProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const isAdmin = myRole === "ADMIN";

  async function handleRemove(member: Member) {
    if (!confirm(`Remove ${member.name || member.email} from the team?`)) return;
    setRemovingId(member.id);
    try {
      const res = await fetch(
        `/api/teams/${teamId}/members?memberId=${member.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to remove member");
        return;
      }
      toast.success(`${member.name || member.email} removed`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleRoleChange(member: Member, newRole: string) {
    setChangingRole(member.id);
    try {
      const res = await fetch(
        `/api/teams/${teamId}/members/${member.id}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to update role");
        return;
      }
      toast.success(`Updated ${member.name || member.email}'s role to ${newRole}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setChangingRole(null);
    }
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isOwner = member.userId === ownerId;
        const isSelf = member.userId === currentUserId;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
                {member.name?.[0]?.toUpperCase() ??
                  member.email[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {member.name || member.email}
                  </p>
                  {isOwner && (
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  {isSelf && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && !isOwner && !isSelf ? (
                <Select
                  value={member.role}
                  onValueChange={(val) => handleRoleChange(member, val)}
                  disabled={changingRole === member.id}
                >
                  <SelectTrigger className="h-8 w-28 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    roleColors[member.role] || roleColors.MEMBER
                  )}
                >
                  <Shield className="h-3 w-3" />
                  {member.role}
                </span>
              )}

              {isAdmin && !isOwner && !isSelf && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(member)}
                  disabled={removingId === member.id}
                >
                  {removingId === member.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
