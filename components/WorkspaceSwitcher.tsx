/**
 * components/WorkspaceSwitcher.tsx
 *
 * Workspace switcher dropdown with green design system.
 */
"use client";

import { useState, useEffect } from "react";
import { useWorkspace, type Workspace } from "@/lib/workspace-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ChevronDown,
  Plus,
  Check,
} from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

export function WorkspaceSwitcher({ isPro }: { isPro: boolean }) {
  const { workspace, switchWorkspace } = useWorkspace();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<TeamItem[]>([]);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setTeams(res.data);
      })
      .catch(() => {});
  }, []);

  const currentLabel =
    workspace.type === "personal"
      ? "Personal"
      : teams.find((t) => t.id === workspace.teamId)?.name ?? "Team";

  const currentIcon =
    workspace.type === "personal"
      ? "🏠"
      : teams.find((t) => t.id === workspace.teamId)?.avatar ?? "👥";

  function handleSelect(ws: Workspace) {
    switchWorkspace(ws);
    setOpen(false);
    if (ws.type === "team") {
      router.push(`/teams/${ws.teamId}`);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl border border-green-200/50 dark:border-green-800/30 bg-white/50 dark:bg-zinc-800/50 px-3 py-2.5 text-left transition-colors hover:bg-green-50/50 dark:hover:bg-green-900/20"
      >
        <span className="text-lg">{currentIcon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{currentLabel}</p>
          <p className="text-xs text-muted-foreground">
            {workspace.type === "personal" ? "Personal workspace" : workspace.role}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-green-200/50 dark:border-green-800/30 bg-white dark:bg-zinc-900 p-1 shadow-lg">
            {/* Personal */}
            <button
              onClick={() => handleSelect({ type: "personal" })}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-green-50 dark:hover:bg-green-900/20",
                workspace.type === "personal" && "bg-green-50 dark:bg-green-900/20"
              )}
            >
              <Home className="h-4 w-4 text-green-500" />
              <span className="flex-1 text-left font-medium text-foreground">Personal</span>
              {workspace.type === "personal" && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </button>

            {/* Teams */}
            {teams.length > 0 && (
              <div className="my-1 border-t border-green-200/50 dark:border-green-800/30" />
            )}
            {teams.map((team) => {
              const isActive =
                workspace.type === "team" && workspace.teamId === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() =>
                    handleSelect({
                      type: "team",
                      teamId: team.id,
                      teamName: team.name,
                      role: team.role,
                    })
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-green-50 dark:hover:bg-green-900/20",
                    isActive && "bg-green-50 dark:bg-green-900/20"
                  )}
                >
                  <span className="text-base">{team.avatar || "👥"}</span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-medium text-foreground">{team.name}</p>
                    <p className="text-xs text-muted-foreground">{team.role}</p>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-green-500" />}
                </button>
              );
            })}

            {/* Create team */}
            {isPro && (
              <>
                <div className="my-1 border-t border-green-200/50 dark:border-green-800/30" />
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/teams/new");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-green-600 dark:text-green-400 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create New Team</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
