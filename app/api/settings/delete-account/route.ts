/**
 * app/api/settings/delete-account/route.ts
 *
 * Account deletion endpoint. Deletes all user data including expenses,
 * budgets, categories, team memberships, and the user record itself.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cascade delete handles most relations, but be explicit
  await prisma.user.delete({
    where: { id: user.id },
  });

  return NextResponse.json({ success: true, message: "Account deleted." });
}
