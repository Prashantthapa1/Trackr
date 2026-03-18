/**
 * app/api/auth/forgot-password/route.ts
 *
 * Generates a password reset token, stores it in VerificationToken,
 * and would normally email the link. For portfolio/dev, we log the URL
 * to the server console. In production, use Resend to send the email.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/types";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, hashedPassword: true },
  });

  // Always return success to prevent email enumeration
  if (!user || !user.hashedPassword) {
    return NextResponse.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Upsert token (delete old ones for this email first)
  await prisma.verificationToken.deleteMany({
    where: { identifier: parsed.data.email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: parsed.data.email,
      token,
      expires,
    },
  });

  // In production: email with Resend. For dev: log to console.
  const resetUrl = `${process.env.AUTH_URL ?? "http://localhost:3001"}/reset-password?token=${token}&email=${encodeURIComponent(parsed.data.email)}`;
  console.log(`🔑 Password reset link for ${parsed.data.email}: ${resetUrl}`);

  return NextResponse.json({
    success: true,
    message: "If that email exists, a reset link has been sent.",
    // DEV ONLY: expose for testing
    ...(process.env.NODE_ENV === "development" && { resetUrl }),
  });
}
