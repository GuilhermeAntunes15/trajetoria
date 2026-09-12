import { Footer } from "@/components/layout/Footer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { brand } from "@/lib/copy";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a href="#conteudo" className="skip-link">
        {brand.skipToContent}
      </a>
      <PublicHeader />
      <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
