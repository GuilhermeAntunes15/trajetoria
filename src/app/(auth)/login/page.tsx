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
      <div className="space-y-2">
        <h1 className="font-display text-[1.75rem] leading-tight font-bold text-ink sm:text-4xl">{authCopy.loginTitle}</h1>
        <p className="text-base text-muted">{authCopy.loginSubtitle}</p>
      </div>

      {params.reset ? (
        <p className="rounded-[var(--radius-sticker)] border-2 border-ink bg-lp-mint px-4 py-2.5 text-sm font-bold text-ink">
          {authCopy.resetDone}
        </p>
      ) : null}

      <Card variant="sticker">
        <CardBody>
          <LoginForm redirectTo={redirectTo} />
        </CardBody>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link
          href="/esqueci-minha-senha"
          className="font-semibold text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline"
        >
          Esqueci minha senha
        </Link>
      </p>
    </div>
  );
}
