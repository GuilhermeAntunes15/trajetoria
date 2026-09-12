import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/app/(auth)/esqueci-minha-senha/ForgotPasswordForm";
import { Card, CardBody } from "@/components/ui/Card";
import { auth as authCopy } from "@/lib/copy";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-ink">{authCopy.forgotTitle}</h1>
        <p className="text-sm text-muted">{authCopy.forgotSubtitle}</p>
      </div>

      <Card>
        <CardBody>
          <ForgotPasswordForm />
        </CardBody>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-brand transition-colors hover:text-brand-hover">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
