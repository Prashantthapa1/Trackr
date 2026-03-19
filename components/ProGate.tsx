/**
 * components/ProGate.tsx
 *
 * Pro-only feature gate with green design system styling.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Lock, Sparkles } from "lucide-react";

interface ProGateProps {
  title: string;
  description: string;
}

export function ProGate({ title, description }: ProGateProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
      </div>
      <Card className="mx-auto max-w-lg border-green-200/50 dark:border-green-800/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
            <Lock className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="font-heading text-xl">Pro Feature</CardTitle>
          <CardDescription className="font-body text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            size="lg"
            onClick={() => setShowUpgrade(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Starting at $5/month
          </p>
        </CardContent>
      </Card>
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}
