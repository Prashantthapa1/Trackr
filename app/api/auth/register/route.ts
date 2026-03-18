/**
 * app/api/auth/register/route.ts
 *
 * Registration API endpoint. Validates input with Zod, checks for existing
 * users, hashes the password with bcryptjs (12 rounds), and creates the
 * User record. Returns the user's id + email so the client can auto-sign-in.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request): Promise<NextResponse> {
  console.log("🔐 Registration attempt started");
  
  try {
    const body = await request.json();
    console.log("📝 Request body received:", { 
      hasName: !!body.name, 
      hasEmail: !!body.email, 
      hasPassword: !!body.password 
    });
    
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.log("❌ Validation failed:", parsed.error.errors);
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    console.log("✅ Validation passed for email:", email);

    console.log("🔍 Checking for existing user...");
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("✅ Password hashed successfully");

    console.log("👤 Creating user in database...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });
    
    console.log("🎉 User created successfully:", { id: user.id, email: user.email });

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error) {
    console.error("💥 Registration error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
