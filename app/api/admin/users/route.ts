/**
 * app/api/admin/users/route.ts
 *
 * Admin API endpoints for user management. Both GET and PATCH verify
 * the requesting user's email matches ADMIN_EMAIL — returning 403 otherwise.
 *
 * GET: Returns all users with expense counts.
 * PATCH: Overrides a user's plan (useful for granting Pro access manually
 * during testing or comp'd accounts).
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { overridePlanSchema } from "@/types";

async function verifyAdmin(): Promise<boolean> {
  const user = await getSession();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

export async function GET(): Promise<NextResponse> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      subscriptionId: true,
      createdAt: true,
      _count: { select: { expenses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      plan: u.plan,
      subscriptionId: u.subscriptionId,
      createdAt: u.createdAt.toISOString(),
      _count: u._count,
    })),
  });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = overridePlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { userId, plan } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { plan },
  });

  return NextResponse.json({
    success: true,
    data: { userId, plan },
  });
}
