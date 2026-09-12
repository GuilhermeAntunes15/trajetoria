import { ButtonLink } from "@/components/ui/ButtonLink";
import { errors } from "@/lib/copy";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink">{errors.notFound}</h1>
      <p className="mt-2 text-sm text-muted">{errors.notFoundText}</p>
      <ButtonLink href="/" className="mt-6">
        Voltar para o início
      </ButtonLink>
    </div>
  );
}
