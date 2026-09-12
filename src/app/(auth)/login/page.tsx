import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { Card, CardBody } from "@/components/ui/Card";
import { auth as authCopy } from "@/lib/copy";
import { safeRedirect } from "@/lib/redirect";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirectTo);

  const viewer = await getViewer();
  if (viewer) {
    redirect(redirectTo);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-ink">{authCopy.loginTitle}</h1>
        <p className="text-sm text-muted">{authCopy.loginSubtitle}</p>
      </div>

      {params.reset ? (
        <p className="rounded-[var(--radius-control)] border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {authCopy.resetDone}
        </p>
      ) : null}

      <Card>
        <CardBody>
          <LoginForm redirectTo={redirectTo} />
        </CardBody>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link href="/esqueci-minha-senha" className="text-brand transition-colors hover:text-brand-hover">
          Esqueci minha senha
        </Link>
      </p>
    </div>
  );
}
