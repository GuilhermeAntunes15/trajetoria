import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      schoolId: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    schoolId: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown> {
    id: string;
    role: Role;
    schoolId: string;
    username: string;
  }
}

export {};
