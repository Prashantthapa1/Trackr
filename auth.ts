/**
 * auth.ts
 *
 * Auth.js v5 configuration. We use two providers:
 * 1) Google OAuth — for one-click sign-in. Auth.js handles the full OAuth flow.
 * 2) Credentials — email/password for users who prefer traditional login.
 *    We hash passwords with bcryptjs and store them in User.hashedPassword.
 *
 * The `callbacks.jwt` enriches the JWT with the user's DB id so we can use it
 * everywhere without an extra DB lookup. The `callbacks.session` exposes that
 * id on the client-side session object.
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            return null;
          }

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.hashedPassword) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.hashedPassword);

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
