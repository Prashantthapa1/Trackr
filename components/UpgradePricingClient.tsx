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
  price: "NPR 0",
  features: [
    { text: "50 expenses per month", included: true },
    { text: "3 categories", included: true },
    { text: "NPR + USD currencies", included: true },
    { text: "Receipt uploads", included: false },
    { text: "Team workspaces", included: false },
    { text: "Visual reports", included: false },
    { text: "PDF/CSV export", included: false },
    { text: "Ask AI insights", included: false },
  ],
};

const proPlan = {
  name: "Pro",
  features: [
    { text: "Unlimited expenses", included: true },
    { text: "Unlimited categories", included: true },
    { text: "All currencies", included: true },
    { text: "Receipt uploads", included: true },
    { text: "5-person team workspaces", included: true },
    { text: "Visual reports & charts", included: true },
    { text: "PDF/CSV export", included: true },
    { text: "Ask AI insights", included: true },
  ],
};

export function UpgradePricingClient({ user }: UpgradePricingClientProps) {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "true";

  const [annual, setAnnual] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);

  const isPro = user.plan !== "FREE";
  const monthlyPrice = 499;
  const annualPrice = 399;
  const displayPrice = annual ? annualPrice : monthlyPrice;

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
          if (env === "sandbox") {
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
    const priceId = annual
      ? process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL
      : process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY;

    if (window.Paddle && priceId) {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email },
        settings: {
          successUrl: `${window.location.origin}/upgrade?upgraded=true`,
          theme: "light",
        },
      });
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
                NPR {displayPrice}
              </span>
              <span className="text-muted-foreground">/month</span>
              {annual && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Billed annually at NPR {annualPrice * 12}/year
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
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade — NPR {displayPrice}/mo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
