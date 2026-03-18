/**
 * lib/notifications.ts
 *
 * In-app notification helper. Creates notification records for users.
 * No email sending — pure in-app system.
 */
import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, link },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Send notification to all members of a team.
 */
export async function notifyTeamMembers(
  teamId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  link?: string,
  excludeUserId?: string
) {
  try {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true },
    });

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerId: true },
    });

    const userIds = [
      ...members.map((m) => m.userId),
      ...(team ? [team.ownerId] : []),
    ].filter((id, i, arr) => arr.indexOf(id) === i && id !== excludeUserId);

    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        message,
        type,
        link,
      })),
    });
  } catch (error) {
    console.error("Failed to notify team members:", error);
  }
}
