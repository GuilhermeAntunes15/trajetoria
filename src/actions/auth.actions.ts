"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { compare, hash } from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { auth as authCopy } from "@/lib/copy";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeRedirect } from "@/lib/redirect";
import { getViewer } from "@/lib/session";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth.schema";

export type FormState = { error?: string; success?: string; email?: string };

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").slice(0, 160);

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: authCopy.invalidCredentials, email };
  }

  const ip = clientIp(await headers());
  const limit = rateLimit(`login:${ip}:${parsed.data.email}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: authCopy.rateLimited, email };
  }

  const redirectTo = safeRedirect(formData.get("redirectTo"));

  revalidatePath("/", "layout");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: authCopy.invalidCredentials, email };
    }
    throw error;
  }

  return {};
}

export async function logoutAction(): Promise<void> {
  revalidatePath("/", "layout");
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? authCopy.forgotGeneric };
  }

  const ip = clientIp(await headers());
  const limit = rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: authCopy.rateLimited };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, isActive: true },
  });

  if (user && user.isActive) {
    const token = randomBytes(32).toString("hex");

    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      }),
    ]);

    if (env.NODE_ENV !== "production") {
      console.log(`[reset] ${env.APP_URL}/trocar-senha?token=${token}`);
    }
  }

  return { success: authCopy.forgotGeneric };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? authCopy.resetInvalidToken };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { error: authCopy.resetInvalidToken };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  redirect("/login?reset=1");
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: authCopy.invalidCredentials };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? authCopy.currentPasswordWrong };
  }

  const user = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: { passwordHash: true },
  });

  if (!user || !(await compare(parsed.data.currentPassword, user.passwordHash))) {
    return { error: authCopy.currentPasswordWrong };
  }

  await prisma.user.update({
    where: { id: viewer.id },
    data: { passwordHash: await hash(parsed.data.password, 12) },
  });

  return { success: authCopy.passwordChanged };
}
