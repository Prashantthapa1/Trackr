/**
 * lib/usage.ts
 *
 * Monthly expense metering system. Instead of running COUNT(*) on the Expense
 * table each time (which gets expensive at scale), we maintain a dedicated
 * Usage row per user per month. The `month` field is a "YYYY-MM" string so
 * lookups are a simple unique index hit. `incrementUsage` is called after
 * every expense creation; `isAtLimit` is called before to gate FREE users.
 */
import { prisma } from "@/lib/prisma";

const FREE_LIMIT = 50;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getMonthlyUsage(userId: string): Promise<{
  count: number;
  limit: number;
  month: string;
}> {
  const month = getCurrentMonth();

  const usage = await prisma.usage.findUnique({
    where: { userId_month: { userId, month } },
  });

  return {
    count: usage?.count ?? 0,
    limit: FREE_LIMIT,
    month,
  };
}

export async function incrementUsage(userId: string): Promise<number> {
  const month = getCurrentMonth();

  const usage = await prisma.usage.upsert({
    where: { userId_month: { userId, month } },
    update: { count: { increment: 1 } },
    create: { userId, month, count: 1 },
  });

  return usage.count;
}

export async function decrementUsage(userId: string): Promise<void> {
  const month = getCurrentMonth();

  const existing = await prisma.usage.findUnique({
    where: { userId_month: { userId, month } },
  });

  if (existing && existing.count > 0) {
    await prisma.usage.update({
      where: { userId_month: { userId, month } },
      data: { count: { decrement: 1 } },
    });
  }
}

export async function isAtLimit(
  userId: string,
  plan: string
): Promise<boolean> {
  if (plan !== "FREE") return false;

  const { count } = await getMonthlyUsage(userId);
  return count >= FREE_LIMIT;
}

export { FREE_LIMIT };
