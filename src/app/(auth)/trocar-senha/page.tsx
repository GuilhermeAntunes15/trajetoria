import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/app/(auth)/trocar-senha/ResetPasswordForm";
import { Card, CardBody } from "@/components/ui/Card";
import { auth as authCopy } from "@/lib/copy";

export const metadata: Metadata = { title: "Trocar senha" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-[1.75rem] leading-tight font-bold text-ink sm:text-4xl">{authCopy.resetTitle}</h1>
        <p className="text-base text-muted">{authCopy.resetSubtitle}</p>
      </div>

      <Card variant="sticker">
        <CardBody>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-base text-muted">{authCopy.resetInvalidToken}</p>
          )}
        </CardBody>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link
          href="/esqueci-minha-senha"
          className="font-semibold text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline"
        >
          Pedir um novo link
        </Link>
      </p>
    </div>
  );
}
