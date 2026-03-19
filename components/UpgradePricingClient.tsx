/**
 * components/UpgradePricingClient.tsx
 *
 * Upgrade pricing page client component with green design system.
 */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { SessionUser } from "@/lib/auth-helpers";
import { Check, X, Sparkles, Crown } from "lucide-react";

interface UpgradePricingClientProps {
  user: SessionUser;
}

const freePlan = {
  name: "Free",
  price: "$0",
  features: [
    { text: "10 expenses per month", included: true },
    { text: "3 categories", included: true },
    { text: "Basic currencies (NPR, USD)", included: true },
    { text: "Receipt uploads", included: false },
    { text: "Team workspaces", included: false },
    { text: "Visual reports", included: false },
    { text: "PDF/CSV export", included: false },
  ],
};

const proMonthlyPlan = {
  name: "Pro Monthly",
  features: [
    { text: "150 expenses per month", included: true },
    { text: "Unlimited categories", included: true },
    { text: "All currencies", included: true },
    { text: "Receipt uploads", included: true },
    { text: "5-person team workspaces", included: true },
    { text: "Visual reports & charts", included: true },
    { text: "PDF/CSV export", included: true },
  ],
};

const proAnnualPlan = {
  name: "Pro Annual",
  features: [
    { text: "Unlimited expenses", included: true },
    { text: "Unlimited categories", included: true },
    { text: "All currencies", included: true },
    { text: "Receipt uploads", included: true },
    { text: "5-person team workspaces", included: true },
    { text: "Visual reports & charts", included: true },
    { text: "PDF/CSV export", included: true },
  ],
};

export function UpgradePricingClient({ user }: UpgradePricingClientProps) {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "true";

  const [annual, setAnnual] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [paddleError, setPaddleError] = useState<string | null>(null);

  const isPro = user.plan !== "FREE";
  const monthlyPrice = 5;  // Paddle has $5/mo
  const annualPrice = 30;
  const displayPrice = annual ? annualPrice : monthlyPrice;
  const displayPriceLabel = annual ? "/year" : "/mo";
  const proPlan = annual ? proAnnualPlan : proMonthlyPlan;
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (upgraded && !confettiFired) {
      setConfettiFired(true);
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#4ade80", "#86efac"],
        });
      });
    }
  }, [upgraded, confettiFired]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          const env = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";
          const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

          if (env === "sandbox") {
            window.Paddle.Environment.set("sandbox");
          }

          if (!clientToken) {
            console.error("Client token is missing!");
            return;
          }

          window.Paddle.Setup({
            token: clientToken,
            eventCallback: (event: { name: string; data?: unknown }) => {
              if (event.name === "checkout.error") {
                setPaddleError("Checkout failed. Please check the console for details.");
              } else if (event.name === "checkout.payment.failed") {
                setPaddleError("Payment declined by Paddle. Please verify your card details are correct or try a different test card.");
              }
            },
          });
        }
      };
      script.onerror = (error) => {
        console.error("Failed to load Paddle script:", error);
      };
      document.head.appendChild(script);
    }
  }, []);

  function handleCheckout() {
    const priceIdMonthly = process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY;
    const priceIdAnnual = process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL;
    const priceId = annual ? priceIdAnnual : priceIdMonthly;

    if (!priceId) {
      setPaddleError("Payment is not configured yet. Please contact support or try again later.");
      return;
    }

    if (!window.Paddle) {
      setPaddleError("Payment system is loading. Please wait a moment and try again.");
      return;
    }

    setPaddleError(null);

    const checkoutConfig = {
      items: [{ priceId, quantity: 1 }],
      customer: { email: user.email },
      settings: {
        displayMode: "overlay" as const,
        successUrl: `${window.location.origin}/upgrade?upgraded=true`,
        theme: "light" as const,
      },
    };

    try {
      window.Paddle.Checkout.open(checkoutConfig);
    } catch (error) {
      console.error("Paddle checkout error:", error);
      setPaddleError("Failed to open checkout. Please try again or contact support.");
    }
  }

  // Dev-only: Instant upgrade for testing
  async function handleDevUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/dev/upgrade", {
        method: "POST",
      });
      if (res.ok) {
        window.location.href = "/upgrade?upgraded=true";
      }
    } catch (err) {
      console.error("Dev upgrade failed:", err);
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {isPro ? "You're on Pro!" : "Upgrade to Pro"}
        </h1>
        <p className="mt-2 text-muted-foreground font-body">
          {isPro
            ? "You have access to all Pro features."
            : "Unlock unlimited expenses, teams, reports, and more."}
        </p>
      </div>

      {/* Success banner */}
      {upgraded && (
        <div className="rounded-2xl border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800/50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Crown className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-green-800 dark:text-green-200">
            Welcome to Pro!
          </h2>
          <p className="text-sm text-green-700 dark:text-green-300">
            All Pro features are now unlocked. Enjoy!
          </p>
        </div>
      )}

      {/* Billing toggle */}
      {!isPro && (
        <div className="flex items-center justify-center gap-3">
          <Label
            htmlFor="billing-toggle"
            className={!annual ? "font-semibold text-foreground" : "text-muted-foreground"}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={annual}
            onCheckedChange={setAnnual}
          />
          <Label
            htmlFor="billing-toggle"
            className={annual ? "font-semibold text-foreground" : "text-muted-foreground"}
          >
            Annual
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </Label>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={`border-green-200/50 dark:border-green-800/30 ${!isPro ? "ring-2 ring-green-500" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-heading">
              {freePlan.name}
              {!isPro && <Badge variant="default">Current Plan</Badge>}
            </CardTitle>
            <CardDescription className="font-body">For personal expense tracking</CardDescription>
            <div className="mt-4">
              <span className="font-heading text-4xl font-bold text-foreground">{freePlan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {freePlan.features.map((feature) => (
                <li key={feature.text} className="flex items-center gap-3 text-sm">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`border-2 ${isPro ? "border-green-500 ring-2 ring-green-500" : "border-green-400"} shadow-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-heading">
              <span className="flex items-center gap-2">
                {proPlan.name}
                <Sparkles className="h-4 w-4 text-green-500" />
              </span>
              {isPro && <Badge variant="default">Current Plan</Badge>}
            </CardTitle>
            <CardDescription className="font-body">For power users & teams</CardDescription>
            <div className="mt-4">
              <span className="font-heading text-4xl font-bold text-foreground">
                ${displayPrice}
              </span>
              <span className="text-muted-foreground">{displayPriceLabel}</span>
              {annual && (
                <p className="mt-1 text-sm text-green-600 font-medium">
                  Save 50% compared to monthly
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {proPlan.features.map((feature) => (
                <li key={feature.text} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>
            {!isPro && (
              <div className="space-y-3">
                {paddleError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50 p-3 text-sm text-red-700 dark:text-red-300">
                    {paddleError}
                  </div>
                )}
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade — ${displayPrice}{displayPriceLabel}
                </Button>
                {isDev && (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleDevUpgrade}
                    disabled={upgrading}
                  >
                    {upgrading ? "Upgrading..." : "⚡ Dev: Instant Pro (Testing)"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
