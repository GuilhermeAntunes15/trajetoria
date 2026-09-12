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
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-ink">{authCopy.resetTitle}</h1>
        <p className="text-sm text-muted">{authCopy.resetSubtitle}</p>
      </div>

      <Card>
        <CardBody>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-muted">{authCopy.resetInvalidToken}</p>
          )}
        </CardBody>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link href="/esqueci-minha-senha" className="text-brand transition-colors hover:text-brand-hover">
          Pedir um novo link
        </Link>
      </p>
    </div>
  );
}
