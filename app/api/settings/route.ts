/**
 * app/api/settings/route.ts
 *
 * Settings API. GET returns user profile. PATCH updates profile (name,
 * monthlyBudget). Separate endpoint for password changes.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/types";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      plan: true,
      monthlyBudget: true,
      createdAt: true,
      _count: { select: { expenses: true } },
    },
  });

  return NextResponse.json({ success: true, data: full });
}

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, monthlyBudget: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
