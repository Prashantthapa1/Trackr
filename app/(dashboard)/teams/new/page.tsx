/**
 * app/(dashboard)/teams/new/page.tsx
 *
 * Create a new team — form page. PRO-gated, max 3 teams.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create team");
        return;
      }
      toast.success("Team created!");
      router.push(`/teams/${data.data.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold">Create Team</h1>
          <p className="text-muted-foreground">
            Set up a new workspace for collaboration.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Team Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                placeholder="e.g., Marketing Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-desc">Description (optional)</Label>
              <Input
                id="team-desc"
                placeholder="What's this team for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl"
                maxLength={200}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-xl shadow-lg shadow-primary/25"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Create Team
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
