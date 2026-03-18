/**
 * app/api/teams/[teamId]/activity/route.ts
 *
 * GET — team activity feed
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
): Promise<NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;

  // Verify access
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const isMember = team.ownerId === user.id ||
    await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: user.id } } });
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "30", 10);

  const activities = await prisma.teamActivity.findMany({
    where: { teamId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    success: true,
    data: activities.map((a) => ({
      id: a.id,
      action: a.action,
      description: a.description,
      userName: a.user.name,
      userEmail: a.user.email,
      metadata: a.metadata,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
