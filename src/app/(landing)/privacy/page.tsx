import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Privacidade</h1>
      <p className="mt-2 text-sm text-muted">
        Esta página explica, em linguagem direta, quais dados o Trajetória guarda e como eles são usados.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink">
        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Quais dados coletamos</h2>
          <p>
            Nome, e-mail institucional, nome de usuário, escola, turma, curso, ano/série, bio, interesses
            e foto de perfil (opcional). Também guardamos o conteúdo que você cria: projetos, evidências,
            competências declaradas, participações em eventos, badges e certificados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Para que usamos</h2>
          <p>
            Para manter seu portfólio escolar, permitir que professores validem projetos e competências e
            registrar a memória institucional da escola. Não usamos seus dados para publicidade e não
            vendemos informações a terceiros.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Visibilidade padrão</h2>
          <p>
            Seu perfil nasce privado. Seus projetos nascem visíveis apenas para a sua escola. A publicação
            fora da escola é opcional e precisa ser ativada por você, projeto a projeto. Seu e-mail nunca
            aparece em páginas públicas, perfis ou listas de equipe.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Isolamento entre escolas</h2>
          <p>
            Cada conta pertence a uma escola. Professores e administradores só acessam dados da própria
            escola. Conteúdo de outra escola só é visível quando marcado como público e já validado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Seus direitos</h2>
          <p>
            Você pode corrigir seus dados de perfil a qualquer momento, alterar a visibilidade dos seus
            projetos e pedir a remoção de conteúdo que você criou. Contas não são excluídas pela interface:
            a administração da escola desativa o acesso quando necessário.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Contato</h2>
          <p>
            Pedidos relacionados aos seus dados devem ser feitos diretamente à secretaria ou à coordenação
            da sua escola, que administra esta instância do Trajetória.
          </p>
        </section>
      </div>
    </div>
  );
}
