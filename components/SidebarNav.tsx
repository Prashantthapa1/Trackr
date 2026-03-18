/**
 * components/SidebarNav.tsx
 *
 * Modern sidebar navigation with green design system.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SessionUser } from "@/lib/auth-helpers";
import { NotificationBell } from "@/components/NotificationBell";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  Receipt,
  Target,
  Settings,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarNavProps {
  user: SessionUser;
}

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/reports", label: "Reports", icon: BarChart3, proBadge: true },
];

const teamNavItems = [
  { href: "/teams", label: "Teams", icon: Users, proBadge: true },
  { href: "/teams/invitations", label: "Invitations", icon: Mail, proBadge: true },
];

const accountNavItems = [
  { href: "/upgrade", label: "Upgrade", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPro = user.plan !== "FREE";

  function renderNavLink(item: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    proBadge?: boolean;
  }) {
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);
    const Icon = item.icon;

    if (item.href === "/upgrade" && isPro) return null;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
            : "text-muted-foreground hover:bg-green-500/10 hover:text-foreground"
        )}
      >
        <Icon className={cn("h-4 w-4", isActive && "text-white")} />
        {item.label}
        {item.proBadge && !isPro && (
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
            Pro
          </Badge>
        )}
      </Link>
    );
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-xl border border-green-200/50 dark:border-green-800/30 bg-white dark:bg-zinc-900 p-2 shadow-sm md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-green-200/50 dark:border-green-800/30 bg-white dark:bg-zinc-900 transition-transform duration-300 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-green-200/50 dark:border-green-800/30 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-lg font-bold leading-tight text-foreground">Trackr</h1>
            <p className="text-[10px] text-muted-foreground">Track & Manage</p>
          </div>
          {isPro && (
            <Badge variant="pro" className="text-[10px] px-1.5 py-0 shrink-0">
              PRO
            </Badge>
          )}
        </div>

        {/* Top actions: theme toggle + notification bell */}
        <div className="flex items-center justify-between border-b border-green-200/50 dark:border-green-800/30 px-4 py-3">
          <ThemeToggle />
          <NotificationBell />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main */}
          <div className="space-y-1">
            <p className="mb-2 px-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Main
            </p>
            {mainNavItems.map(renderNavLink)}
          </div>

          {/* Team */}
          <div className="space-y-1">
            <p className="mb-2 px-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Collaboration
            </p>
            {teamNavItems.map(renderNavLink)}
          </div>

          {/* Account */}
          <div className="space-y-1">
            <p className="mb-2 px-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            {accountNavItems.map(renderNavLink)}
          </div>
        </nav>

        <Separator className="bg-green-200/50 dark:bg-green-800/30" />

        {/* User section */}
        <div className="p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-green-500/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-sm font-semibold text-white">
              {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name ?? "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {isPro ? "Pro Plan" : "Free Plan"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground hover:bg-green-500/10"
            onClick={async () => {
              try {
                const callbackUrl = window.location.origin;
                const res = await signOut({ redirect: false, callbackUrl });
                if ((res as any)?.error) {
                  window.location.href = callbackUrl;
                } else {
                  const redirectTo = (res as any)?.url ?? callbackUrl;
                  window.location.href = redirectTo;
                }
              } catch {
                try {
                  window.location.href = '/';
                } catch {}
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
