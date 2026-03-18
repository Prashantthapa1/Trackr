/**
 * app/api/teams/invitations/route.ts
 *
 * GET — list pending invitations for the current user
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

export async function GET(): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invitations = await prisma.teamInvitation.findMany({
    where: { email: user.email, status: "PENDING", expiresAt: { gt: new Date() } },
    include: {
      team: { select: { id: true, name: true, avatar: true } },
      inviter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: invitations.map((inv) => ({
      id: inv.id,
      teamId: inv.teamId,
      teamName: inv.team.name,
      teamAvatar: inv.team.avatar,
      role: inv.role,
      inviterName: inv.inviter.name || inv.inviter.email,
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
    })),
  });
}
