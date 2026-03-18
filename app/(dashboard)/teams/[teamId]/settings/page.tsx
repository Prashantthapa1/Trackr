/**
 * app/(dashboard)/teams/[teamId]/settings/page.tsx
 *
 * Team settings — edit name, description, leave or delete the team.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Save,
  Loader2,
  LogOut,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function TeamSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/teams/${teamId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setName(res.data.name);
          setDescription(res.data.description ?? "");
          setIsOwner(res.data.isOwner ?? false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save");
        return;
      }
      toast.success("Settings updated!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this team?")) return;
    setLeaving(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/leave`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to leave");
        return;
      }
      toast.success("You left the team");
      router.push("/teams");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLeaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to DELETE this team? This action is permanent."
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete");
        return;
      }
      toast.success("Team deleted");
      router.push("/teams");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${teamId}`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Team configuration</p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl"
                maxLength={200}
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 rounded-xl"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="rounded-2xl border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isOwner && (
            <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
              <div>
                <p className="text-sm font-medium">Leave Team</p>
                <p className="text-xs text-muted-foreground">
                  You can rejoin if invited again.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-1.5 rounded-xl text-amber-600 hover:bg-amber-50"
                onClick={handleLeave}
                disabled={leaving}
              >
                {leaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Leave
              </Button>
            </div>
          )}
          {isOwner && (
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Delete Team
                </p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete this team and all its data.
                </p>
              </div>
              <Button
                variant="destructive"
                className="gap-1.5 rounded-xl"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
