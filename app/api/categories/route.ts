/**
 * app/api/categories/route.ts
 *
 * Custom category management. PRO users can create unlimited custom categories
 * with emoji icons and colors. FREE users get the default set only.
 * GET returns user's custom categories, POST creates a new one, DELETE removes.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/types";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.plan === "FREE") {
    return NextResponse.json(
      { error: "Custom categories require PRO plan." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        icon: parsed.data.icon ?? "📁",
        color: parsed.data.color ?? "#6366f1",
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
