/**
 * components/UpgradeModal.tsx
 *
 * Upgrade modal with green design system styling.
 */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userEmail?: string;
}

declare global {
  interface Window {
    Paddle?: {
      Checkout: {
        open: (options: Record<string, unknown>) => void;
      };
      Environment: {
        set: (env: string) => void;
      };
      Setup: (options: Record<string, unknown>) => void;
    };
  }
}

const proFeatures = [
  "150+ expenses per month (unlimited with annual)",
  "Unlimited custom categories",
  "All currencies supported",
  "Receipt image uploads",
  "5-person team workspaces",
  "PDF & CSV export",
  "Visual reports & charts",
];

const freeFeatures = [
  "10 expenses per month",
  "3 categories",
  "NPR + USD only",
];

export function UpgradeModal({
  open: controlledOpen,
  onOpenChange,
  userEmail,
}: UpgradeModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [annual, setAnnual] = useState(false);

  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";
          if (paddleEnv === "sandbox") {
            window.Paddle.Environment.set("sandbox");
          }
          window.Paddle.Setup({
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  function handleCheckout() {
    console.log("[UpgradeModal] Starting checkout...");
    console.log("[UpgradeModal] Annual:", annual);

    const priceIdMonthly = process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY;
    const priceIdAnnual = process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL;
    const priceId = annual ? priceIdAnnual : priceIdMonthly;

    console.log("[UpgradeModal] Monthly Price ID:", priceIdMonthly || "MISSING!");
    console.log("[UpgradeModal] Annual Price ID:", priceIdAnnual || "MISSING!");
    console.log("[UpgradeModal] Selected Price ID:", priceId || "MISSING!");

    if (!priceId) {
      console.error("[UpgradeModal] ERROR: No price ID!");
      return;
    }

    if (!window.Paddle) {
      console.error("[UpgradeModal] ERROR: Paddle not loaded!");
      return;
    }

    const checkoutConfig = {
      items: [{ priceId, quantity: 1 }],
      customer: userEmail ? { email: userEmail } : undefined,
      settings: {
        displayMode: "overlay" as const,
        successUrl: `${window.location.origin}/dashboard?upgraded=true`,
        theme: "light" as const,
      },
    };

    console.log("[UpgradeModal] Config:", JSON.stringify(checkoutConfig, null, 2));

    try {
      window.Paddle.Checkout.open(checkoutConfig);
      console.log("[UpgradeModal] Checkout.open() called");
    } catch (error) {
      console.error("[UpgradeModal] Error:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <Sparkles className="h-5 w-5 text-green-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="font-body">
            Unlock unlimited expenses, team features, reports, and more.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-sm ${!annual ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                annual ? "bg-green-500" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm ${annual ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              Annual
              <Badge variant="secondary" className="ml-1">
                20% off
              </Badge>
            </span>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="font-heading text-4xl font-bold text-foreground">
              ${annual ? "30" : "5"}
              <span className="text-lg font-normal text-muted-foreground">
                {annual ? "/year" : "/mo"}
              </span>
            </div>
            {annual && (
              <p className="text-sm text-green-600 font-medium">
                Save 50% + unlimited expenses
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Everything in Free, plus:
            </p>
            <div className="space-y-2">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Free plan reminder */}
          <div className="rounded-xl border border-green-200/50 bg-green-50/50 p-4 dark:border-green-800/30 dark:bg-green-900/10">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Free plan includes:
            </p>
            <div className="space-y-1">
              {freeFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Lock className="h-3 w-3" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro — ${annual ? "30/year" : "5/mo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
