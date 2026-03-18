/**
 * app/api/settings/password/route.ts
 *
 * Change password endpoint. Verifies current password, hashes new one.
 * Only works for credential-based accounts (not OAuth-only).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/types";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { hashedPassword: true },
  });

  if (!dbUser?.hashedPassword) {
    return NextResponse.json(
      { error: "Account uses OAuth login — no password to change." },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    dbUser.hashedPassword
  );
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword: hashed },
  });

  return NextResponse.json({ success: true, message: "Password updated." });
}
