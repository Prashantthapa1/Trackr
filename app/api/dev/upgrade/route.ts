/**
 * app/api/dev/upgrade/route.ts
 *
 * DEV-ONLY: Instantly upgrade user to PRO for testing.
 * This endpoint only works in development mode.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(): Promise<NextResponse> {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { plan: "PRO" },
  });

  return NextResponse.json({ success: true, plan: "PRO" });
}
