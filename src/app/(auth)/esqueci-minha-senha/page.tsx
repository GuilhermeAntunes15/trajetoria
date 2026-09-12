import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/app/(auth)/esqueci-minha-senha/ForgotPasswordForm";
import { Card, CardBody } from "@/components/ui/Card";
import { auth as authCopy } from "@/lib/copy";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-[1.75rem] leading-tight font-bold text-ink sm:text-4xl">{authCopy.forgotTitle}</h1>
        <p className="text-base text-muted">{authCopy.forgotSubtitle}</p>
      </div>

      <Card variant="sticker">
        <CardBody>
          <ForgotPasswordForm />
        </CardBody>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link
          href="/login"
          className="font-semibold text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline"
        >
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
