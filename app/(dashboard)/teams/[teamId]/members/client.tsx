/**
 * app/(dashboard)/teams/[teamId]/members/client.tsx
 *
 * Client component for triggering invite modal.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";

export function TeamMembersClient({
  teamId,
  myRole,
}: {
  teamId: string;
  myRole: string;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  if (myRole !== "ADMIN") return null;

  return (
    <>
      <Button
        className="gap-2 rounded-xl shadow-lg shadow-primary/25"
        onClick={() => setInviteOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Invite Member
      </Button>
      <InviteMemberModal
        teamId={teamId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </>
  );
}
