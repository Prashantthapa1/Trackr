/**
 * lib/team-activity.ts
 *
 * Helper to log team activity events. Call after every team mutation.
 */
import { prisma } from "@/lib/prisma";
import type { ActivityType, Prisma } from "@prisma/client";

export async function logTeamActivity(
  teamId: string,
  userId: string,
  action: ActivityType,
  description: string,
  metadata?: Prisma.InputJsonValue
) {
  try {
    await prisma.teamActivity.create({
      data: {
        teamId,
        userId,
        action,
        description,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    // Don't let activity logging break the main operation
    console.error("Failed to log team activity:", error);
  }
}
