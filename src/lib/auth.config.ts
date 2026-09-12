import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { safeRedirect } from "@/lib/redirect";

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/settings",
  "/notifications",
  "/teacher",
  "/admin",
  "/projects/new",
];

function isPrivatePath(pathname: string): boolean {
  if (PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  return pathname.endsWith("/edit") || pathname.endsWith("/fork");
}

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login", error: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.schoolId = user.schoolId;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.schoolId = token.schoolId;
        session.user.username = token.username;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname, search } = request.nextUrl;
      if (!isPrivatePath(pathname)) return true;
      if (auth?.user) return true;

      const target = safeRedirect(`${pathname}${search}`, "/dashboard");
      const loginUrl = new URL("/login", request.nextUrl);
      loginUrl.searchParams.set("redirectTo", target);
      return NextResponse.redirect(loginUrl);
    },
  },
} satisfies NextAuthConfig;
