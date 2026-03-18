/**
 * app/api/receipts/upload/route.ts
 *
 * Receipt image upload endpoint using Vercel Blob storage. Pro-gated — FREE
 * users get a 403. Accepts multipart form data with a single "file" field.
 * Returns the public URL of the uploaded blob, which gets stored on the
 * Expense.receiptUrl field.
 *
 * Vercel Blob handles CDN distribution, so receipt images load fast globally.
 * We limit file size to 4MB (Vercel Blob free tier limit).
 */
import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth-helpers";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.plan === "FREE") {
    return NextResponse.json(
      { error: "Receipt uploads require a Pro plan" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 4MB limit" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, PDF" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`receipts/${user.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json(
      { success: true, data: { url: blob.url } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Blob upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
