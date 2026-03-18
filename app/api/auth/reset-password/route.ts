/**
 * app/api/auth/reset-password/route.ts
 *
 * Validates the reset token and updates the user's password.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/types";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // Find valid token
  const record = await prisma.verificationToken.findFirst({
    where: {
      token: parsed.data.token,
      expires: { gt: new Date() },
    },
  });

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired reset token." },
      { status: 400 }
    );
  }

  // Hash new password
  const hashed = await bcrypt.hash(parsed.data.password, 12);

  // Update user
  await prisma.user.update({
    where: { email: record.identifier },
    data: { hashedPassword: hashed },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token: record.token,
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Password has been reset. You can now sign in.",
  });
}
