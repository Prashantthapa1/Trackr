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
import { createHash } from "crypto";
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
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 503 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `trackr/receipts/${user.id}`;
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("api_key", process.env.CLOUDINARY_API_KEY ?? "");
    uploadData.append("timestamp", String(timestamp));
    uploadData.append("folder", folder);
    uploadData.append("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: uploadData,
    });
    const result = await response.json();
    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message ?? "Cloudinary upload failed");
    }

    return NextResponse.json(
      { success: true, data: { url: result.secure_url } },
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
