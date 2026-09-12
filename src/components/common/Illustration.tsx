import { cn } from "@/lib/utils";

/**
 * Ilustrações do "caderno de projetos": contorno preto grosso, blocos de cor
 * chapada e nenhum detalhe supérfluo. São SVG inline — sem imagem externa,
 * sem dependência nova — e puramente decorativas (`aria-hidden`), então o
 * texto ao lado precisa continuar dizendo tudo sozinho.
 */

export type IllustrationName =
  | "notebook"
  | "magnifier"
  | "bell"
  | "collection"
  | "certificate"
  | "map";

const INK = "var(--color-ink)";

type Props = { name: IllustrationName; className?: string };

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={cn("h-28 w-auto", className)}
      fill="none"
      stroke={INK}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Caderno em branco — vazio de portfólio e de projetos. */
function Notebook({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="30" y="16" width="96" height="88" rx="8" fill="var(--color-surface)" />
      <path d="M30 30h96M30 46h96M30 62h96M30 78h96" strokeWidth="2" opacity="0.22" />
      <rect x="22" y="16" width="16" height="88" rx="8" fill="var(--color-lp-mint)" />
      <circle cx="30" cy="38" r="3.5" fill="var(--color-surface)" />
      <circle cx="30" cy="60" r="3.5" fill="var(--color-surface)" />
      <circle cx="30" cy="82" r="3.5" fill="var(--color-surface)" />
      <path d="M56 92l14-16 12 9 16-24 12 14" stroke="var(--color-brand)" />
      <circle cx="110" cy="75" r="5" fill="var(--color-lp-sun)" />
    </Frame>
  );
}

/** Lupa — busca sem resultado. */
function Magnifier({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <circle cx="70" cy="52" r="30" fill="var(--color-lp-sky)" />
      <path d="M92 74l24 26" strokeWidth="7" />
      <path d="M58 44a17 17 0 0 1 14-8" strokeWidth="3" stroke="var(--color-surface)" />
      <path d="M120 24l6 6M126 24l-6 6" strokeWidth="3" stroke="var(--color-lp-tangerine)" />
    </Frame>
  );
}

/** Sino — caixa de notificações vazia. */
function BellIllustration({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <path
        d="M52 78c8-6 8-14 8-24a20 20 0 0 1 40 0c0 10 0 18 8 24z"
        fill="var(--color-lp-sun)"
      />
      <path d="M46 78h68" />
      <path d="M70 88a10 10 0 0 0 20 0" fill="var(--color-surface)" />
      <path d="M80 34v-8" />
      <path d="M118 40l10-6M118 56h11" strokeWidth="3" opacity="0.4" />
    </Frame>
  );
}

/** Coleção de conquistas — troféu sobre a prateleira. */
function Collection({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <path d="M60 26h40v18a20 20 0 0 1-40 0z" fill="var(--color-lp-sun)" />
      <path d="M60 30H46v8a14 14 0 0 0 14 12" />
      <path d="M100 30h14v8a14 14 0 0 1-14 12" />
      <path d="M80 64v14M66 86h28l-4-8H70z" fill="var(--color-lp-mint)" />
      <path d="M40 98h80" strokeWidth="4" />
      <circle cx="34" cy="60" r="9" fill="var(--color-lp-sky)" />
      <circle cx="126" cy="72" r="7" fill="var(--color-lp-tangerine)" />
    </Frame>
  );
}

/** Certificado — folha com selo e código. */
function Certificate({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <rect x="28" y="20" width="88" height="80" rx="6" fill="var(--color-surface)" />
      <path d="M42 40h60M42 54h60M42 68h36" strokeWidth="3" opacity="0.3" />
      <circle cx="112" cy="80" r="16" fill="var(--color-lp-mint)" />
      <path d="M104 80l6 6 11-13" stroke="var(--color-brand)" strokeWidth="4" />
      <path d="M126 22l6 4-6 4" strokeWidth="3" opacity="0.4" />
    </Frame>
  );
}

/** Mapa da trajetória — pontos ligados por linha tracejada. */
function TrajectoryMap({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <path
        d="M28 88c18-6 20-34 40-34s22 26 40 22 16-28 24-32"
        strokeDasharray="2 10"
        strokeWidth="4"
        opacity="0.5"
      />
      <circle cx="28" cy="88" r="10" fill="var(--color-lp-mint)" />
      <circle cx="68" cy="54" r="10" fill="var(--color-lp-sky)" />
      <circle cx="108" cy="76" r="10" fill="var(--color-lp-sun)" />
      <circle cx="132" cy="44" r="12" fill="var(--color-brand)" />
      <path d="M126 44l5 5 9-11" stroke="var(--color-surface)" strokeWidth="4" />
    </Frame>
  );
}

const ILLUSTRATIONS: Record<IllustrationName, (props: { className?: string }) => React.ReactElement> =
  {
    notebook: Notebook,
    magnifier: Magnifier,
    bell: BellIllustration,
    collection: Collection,
    certificate: Certificate,
    map: TrajectoryMap,
  };

export function Illustration({ name, className }: Props) {
  const Drawing = ILLUSTRATIONS[name];
  return <Drawing className={className} />;
}
