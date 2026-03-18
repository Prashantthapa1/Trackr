/**
 * app/layout.tsx
 *
 * Root layout for the entire app. Server Component with fonts,
 * theme provider, reveal observer, and toast notifications.
 */
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RevealObserver } from "@/components/RevealObserver";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trackr — Smart Expense Tracking",
  description:
    "Smart expense tracking for individuals & teams. Track expenses, manage budgets, and gain insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider>
          <RevealObserver />
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "bg-white dark:bg-zinc-900 border-green-200/50 dark:border-green-800/30 shadow-lg",
                title: "font-heading text-foreground",
                description: "font-body text-muted-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
