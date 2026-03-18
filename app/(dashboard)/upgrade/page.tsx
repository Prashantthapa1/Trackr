/**
 * app/(dashboard)/upgrade/page.tsx
 *
 * Pricing page with a monthly/annual toggle and detailed Free vs Pro
 * comparison. This is a Server Component that fetches the user's plan,
 * then passes it to a Client Component for the interactive toggle and
 * Paddle checkout trigger.
 *
 * After successful Paddle checkout, the user is redirected back here with
 * ?upgraded=true — the UpgradeSuccess component fires confetti and shows
 * a success banner.
 */
import { requireAuth } from "@/lib/auth-helpers";
import { UpgradePricingClient } from "@/components/UpgradePricingClient";

export default async function UpgradePage() {
  const user = await requireAuth();

  return <UpgradePricingClient user={user} />;
}
