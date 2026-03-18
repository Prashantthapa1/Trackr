/**
 * app/(dashboard)/layout.tsx
 *
 * Dashboard shell layout with top navigation and animated background.
 * Server Component that fetches user session.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { DashboardTopNav } from "@/components/DashboardTopNav";
import { WorkspaceProvider } from "@/lib/workspace-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Animated Background Blobs - matching landing page style */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-green-400/20 to-green-500/25 blur-[80px] animate-float-blob" />
          <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-green-300/15 to-emerald-400/15 blur-[80px] animate-float-blob-delayed" />
          <div className="absolute -bottom-32 right-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-emerald-400/20 to-green-500/15 blur-[80px] animate-float-blob-slow" />
          {/* Subtle grid overlay */}
          <div className="hero-grid opacity-30" />
        </div>

        <DashboardTopNav user={user} />
        <main className="relative z-10 w-full pt-20">
          <div className="w-full px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </WorkspaceProvider>
  );
}
