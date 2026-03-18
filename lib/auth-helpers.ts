/**
 * lib/auth-helpers.ts
 *
 * Thin wrappers around Auth.js's `auth()` function. These are used in Server
 * Components and API routes to avoid repeating session-check boilerplate.
 * `requireAuth` throws a redirect if no session — safe to call at the top
 * of any protected Server Component. `requirePro` additionally checks the plan.
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: Plan;
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, image: true, plan: true },
  });

  return user;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requirePro(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.plan === "FREE") {
    redirect("/upgrade");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }
  return user;
}
