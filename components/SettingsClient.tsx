/**
 * components/SettingsClient.tsx
 *
 * Settings page client component with green design system.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Lock,
  Trash2,
  Loader2,
  Save,
  Calendar,
  Mail,
  Shield,
} from "lucide-react";

interface SettingsUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: string;
  monthlyBudget: number | null;
  hasPassword: boolean;
  createdAt: string;
  expenseCount: number;
}

interface SettingsClientProps {
  user: SettingsUser;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name ?? "");
  const [monthlyBudget, setMonthlyBudget] = useState(
    user.monthlyBudget?.toString() ?? ""
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg("Profile updated!");
        router.refresh();
      } else {
        setProfileMsg(data.error ?? "Failed to update.");
      }
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg("Passwords don't match.");
      return;
    }
    setPwLoading(true);
    setPwMsg("");
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg("Password updated!");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        setPwMsg(data.error ?? "Failed to update password.");
      }
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "DELETE",
      });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Account Info */}
      <Card className="border-green-200/50 dark:border-green-800/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <UserIcon className="h-5 w-5 text-green-500" />
            Account Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Plan:</span>
            <Badge variant={user.plan === "PRO" ? "pro" : "default"}>
              {user.plan}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Member since:</span>
            <span className="font-medium text-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Total expenses tracked:{" "}
            <span className="font-semibold text-foreground">{user.expenseCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Profile Edit */}
      <Card className="border-green-200/50 dark:border-green-800/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <UserIcon className="h-5 w-5 text-green-500" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Display Name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-budget">Default Monthly Budget (NPR)</Label>
              <Input
                id="settings-budget"
                type="number"
                step="0.01"
                min="0"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="e.g. 50000"
              />
              <p className="text-xs text-muted-foreground">
                Quick overall budget — use the Budgets page for detailed category budgets.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
              {profileMsg && (
                <span
                  className={`text-sm ${profileMsg.includes("updated") ? "text-green-600" : "text-red-500"}`}
                >
                  {profileMsg}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      {user.hasPassword && (
        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Lock className="h-5 w-5 text-green-500" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw">Current Password</Label>
                <Input
                  id="current-pw"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pw">New Password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={pwLoading}>
                  {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
                {pwMsg && (
                  <span
                    className={`text-sm ${pwMsg.includes("updated") ? "text-green-600" : "text-red-500"}`}
                  >
                    {pwMsg}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Separator className="bg-red-200 dark:bg-red-900/30" />
          <div className="space-y-2">
            <Label htmlFor="delete-confirm" className="text-sm">
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to
              confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="max-w-xs border-red-200 dark:border-red-900/50"
            />
          </div>
          <Button
            variant="destructive"
            disabled={deleteConfirm !== "DELETE" || deleteLoading}
            onClick={handleDeleteAccount}
          >
            {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete My Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
