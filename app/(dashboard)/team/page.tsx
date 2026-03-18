/**
 * app/(dashboard)/team/page.tsx
 *
 * Redirect old /team route to /teams for backwards compatibility.
 */
import { redirect } from "next/navigation";

export default function OldTeamPage() {
  redirect("/teams");
}
