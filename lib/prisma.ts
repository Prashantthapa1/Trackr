/**
 * lib/prisma.ts
 *
 * Singleton PrismaClient instance. In development, Next.js hot-reloads modules
 * on every save, which would create a new PrismaClient each time and exhaust
 * DB connections. We stash the client on `globalThis` so it survives reloads.
 * In production, the module is only imported once, so this is a no-op.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
