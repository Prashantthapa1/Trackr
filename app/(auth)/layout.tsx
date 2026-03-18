/**
 * app/(auth)/layout.tsx
 *
 * Auth pages layout with animated background and theme toggle.
 */
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-500/30 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-green-500/25 to-teal-500/25 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-green-500/30 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Noise Texture */}
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('/noise.svg')]" />

      {/* Theme Toggle */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
