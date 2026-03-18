/**
 * app/(dashboard)/settings/page.tsx
 *
 * Settings page — profile editing, password change, theme toggle,
 * and account deletion. Server Component that fetches user data.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const user = await requireAuth();

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      plan: true,
      monthlyBudget: true,
      hashedPassword: true,
      createdAt: true,
      _count: { select: { expenses: true } },
    },
  });

  if (!full) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          We could not load your settings. Please refresh and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground font-body">
          Manage your account preferences.
        </p>
      </div>
      <div className="animate-fade-up-delay-1">
        <SettingsClient
          user={{
            id: full.id,
            email: full.email,
            name: full.name,
            image: full.image,
            plan: full.plan,
            monthlyBudget: full.monthlyBudget,
            hasPassword: !!full.hashedPassword,
            createdAt: full.createdAt.toISOString(),
            expenseCount: full._count.expenses,
          }}
        />
      </div>
    </div>
  );
}
