/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * Auth.js v5 catch-all API route. This handles all OAuth callbacks, sign-in,
 * sign-out, and session endpoints. We simply re-export the handlers from our
 * central auth.ts config so the logic stays in one place.
 */
import { handlers } from "@/auth";
import { NextRequest } from "next/server";

// Wrap handlers with logging
const { GET: originalGET, POST: originalPOST } = handlers;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  console.log("🔐 Auth GET request:", {
    pathname: url.pathname,
    searchParams: Object.fromEntries(url.searchParams.entries())
  });
  
  try {
    const result = await originalGET(request);
    console.log("✅ Auth GET success:", result.status);
    return result;
  } catch (error) {
    console.error("💥 Auth GET error:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  console.log("🔐 Auth POST request:", {
    pathname: url.pathname,  
    searchParams: Object.fromEntries(url.searchParams.entries())
  });
  
  try {
    const result = await originalPOST(request);
    console.log("✅ Auth POST success:", result.status);
    return result;
  } catch (error) {
    console.error("💥 Auth POST error:", error);
    throw error;
  }
}
