"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SessionUser } from "@/lib/auth-helpers";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  Mail,
  Menu,
  X,
  Receipt,
  LogOut,
  Target,
} from "lucide-react";

interface DashboardTopNavProps {
  user: SessionUser;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/reports", label: "Reports", icon: BarChart3, proBadge: true },
  { href: "/teams", label: "Teams", icon: Users, proBadge: true },
  { href: "/teams/invitations", label: "Invitations", icon: Mail, proBadge: true },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/upgrade", label: "Upgrade", icon: CreditCard },
];

export function DashboardTopNav({ user }: DashboardTopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPro = user.plan !== "FREE";

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-green-200/50 bg-white/85 backdrop-blur-xl transition-all duration-300 dark:border-green-800/30 dark:bg-zinc-900/85">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]">
            <Receipt className="h-5 w-5" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            Trackr
          </span>
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse-dot" />
          {isPro && (
            <Badge variant="pro" className="text-[10px]">
              PRO
            </Badge>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems
            .filter((item) => !(item.href === "/upgrade" && isPro))
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    active
                      ? "bg-green-500 text-white shadow-md shadow-green-500/25 scale-[1.02]"
                      : "text-muted-foreground hover:bg-green-500/10 hover:text-green-600 hover:scale-[1.03] dark:hover:text-green-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.proBadge && !isPro && (
                    <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0">
                      Pro
                    </Badge>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
            onClick={async () => {
              const callbackUrl = window.location.origin;
              try {
                const res = await signOut({ redirect: false, callbackUrl });
                window.location.href = (res as any)?.url ?? callbackUrl;
              } catch {
                window.location.href = callbackUrl;
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-green-200/50 bg-white/95 backdrop-blur-md px-4 py-4 md:hidden dark:border-green-800/30 dark:bg-zinc-900/95">
          <nav className="grid gap-1">
            {navItems
              .filter((item) => !(item.href === "/upgrade" && isPro))
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-green-500 text-white"
                        : "text-muted-foreground hover:bg-green-500/10 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                    {item.proBadge && !isPro && (
                      <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0">
                        Pro
                      </Badge>
                    )}
                  </Link>
                );
              })}
            <Button
              variant="ghost"
              className="justify-start mt-2 text-muted-foreground"
              onClick={async () => {
                const callbackUrl = window.location.origin;
                try {
                  const res = await signOut({ redirect: false, callbackUrl });
                  window.location.href = (res as any)?.url ?? callbackUrl;
                } catch {
                  window.location.href = callbackUrl;
                }
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
