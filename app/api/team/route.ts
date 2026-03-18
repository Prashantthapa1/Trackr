/**
 * app/api/team/route.ts
 *
 * DEPRECATED: This route exists for backwards compatibility.
 * The new team API lives at /api/teams/*.
 */
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    error: "This endpoint is deprecated. Use /api/teams instead.",
    redirect: "/api/teams",
  }, { status: 301 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    error: "This endpoint is deprecated. Use /api/teams instead.",
    redirect: "/api/teams",
  }, { status: 301 });
}
