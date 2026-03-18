/**
 * app/admin/page.tsx
 *
 * Admin dashboard — only accessible if the logged-in user's email matches
 * ADMIN_EMAIL. Shows a user table, MRR (Monthly Recurring Revenue) display,
 * a fake churn chart placeholder, and a plan override control.
 *
 * This is a Server Component that fetches all users and computes MRR.
 * The admin check happens server-side via requireAdmin().
 */
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      subscriptionId: true,
      createdAt: true,
      _count: { select: { expenses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const proUsersCount = users.filter((u) => u.plan === "PRO").length;
  const monthlyMRR = proUsersCount * 499; // NPR 499/mo per Pro user
  const totalUsers = users.length;

  const serialized = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    plan: u.plan,
    subscriptionId: u.subscriptionId,
    createdAt: u.createdAt.toISOString(),
    _count: u._count,
  }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-green-400/20 to-green-500/25 blur-[80px] animate-float-blob" />
        <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-green-300/15 to-emerald-400/15 blur-[80px] animate-float-blob-delayed" />
        <div className="hero-grid opacity-30" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <AdminClient
          users={serialized}
          stats={{
            totalUsers,
            proUsersCount,
            monthlyMRR,
          }}
        />
      </div>
    </div>
  );
}
