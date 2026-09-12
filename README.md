# Trajetória

**Transforme o que você constrói na escola em parte da sua trajetória.**

Plataforma de portfólio acadêmico para escolas — uma espécie de "GitHub dos projetos escolares".
O aluno cria o projeto, documenta, o professor valida, o projeto entra no portfólio e as
competências ficam registradas. O projeto continua existindo depois da apresentação.

Não é rede social: não há feed infinito, likes, seguidores, streak nem ranking de popularidade.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Principais pastas](#principais-pastas)
- [Banco de dados](#banco-de-dados)
- [Como rodar localmente](#como-rodar-localmente)
- [Credenciais de demonstração](#credenciais-de-demonstração)
- [Roteiro de demonstração](#roteiro-de-demonstração)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Deploy no Railway](#deploy-no-railway)
- [Testes](#testes)
- [Scripts](#scripts)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Roadmap](#roadmap)

---

## Arquitetura

Monolito Next.js (App Router) com PostgreSQL via Prisma. Sem microserviços, sem backend separado.

```
Browser
  │
  ├─ Server Components (leitura)  ──► Prisma ──► PostgreSQL
  ├─ Server Actions (escrita)     ──► services ──► Prisma
  └─ Route Handlers (/api/*)      ──► QR (PNG), PDF, upload, arquivos, health
```

Camadas:

| Camada | Onde | Responsabilidade |
|---|---|---|
| Páginas | `src/app/**` | Server Components por padrão; Client Component só quando há interação. |
| Actions | `src/actions/*.actions.ts` | `getViewer()` → Zod → permissão → escrita → `revalidatePath`. |
| Services | `src/server/services/*.service.ts` | Regras com mais de um passo (projeto, validação, badge, certificado, busca, notificação). |
| Permissões | `src/lib/permissions.ts` | Funções puras, sem Prisma, testadas unitariamente. |
| Storage | `src/lib/storage/*` | Abstração `StorageProvider` com implementação local e S3-compatible. |

Regras que não se quebram:

- Toda consulta de listagem filtra por `schoolId` no banco — nunca em memória.
- Toda action valida no servidor com Zod, mesmo que o formulário já valide no cliente.
- `getViewer()` lê `role` e `schoolId` do banco (com `cache()` do React); o JWT só diz que a
  pessoa está logada.
- Aluno nunca valida o próprio projeto; professor/admin não revisam projeto em que são
  integrantes; ninguém acessa dados de outra escola (exceto conteúdo público).

## Stack

| Pacote | Versão |
|---|---|
| Next.js | 15.5.25 (App Router, `output: standalone`) |
| React | 19.3.0 |
| TypeScript | 5.9.3 (`strict`) |
| Prisma | 6.19.3 |
| PostgreSQL | 16 |
| Auth.js (next-auth) | 5.0.0-beta.32 — Credentials + JWT |
| Tailwind CSS | 4.3.3 (configuração via `@theme` no CSS, sem arquivo de config) |
| Zod | 3.25.76 · React Hook Form 7.88 |
| Lucide Icons | 1.45 |
| pdfkit | 0.20 (certificado em PDF) · qrcode 1.5 (QR em PNG) |
| @aws-sdk/client-s3 | 3.x (storage S3-compatible) |
| Vitest | 3.2.7 |

Sem shadcn/ui: os primitivos de interface são próprios (`src/components/ui`).

## Principais pastas

```
prisma/                 schema.prisma, migrations/, seed.ts
public/                 icon.svg, icons/ (PWA), manifest.webmanifest, seed/ (capas da demo)
scripts/                generate-icons.mjs, setup-test-db.mjs
tests/                  testes unitários + tests/integration (precisam de banco)
src/app/
  (landing)/            / e /privacy
  (auth)/               /login, /esqueci-minha-senha, /trocar-senha
  (main)/               dashboard, projects, events, s/[schoolSlug], u/[username],
                        certificate/[code], search, notifications, settings, onboarding
  (teacher)/            /teacher e subpáginas
  (admin)/              /admin e subpáginas
  api/                  health, auth, upload, files, projects/[slug]/qr, certificates/[code]/{pdf,qr}
src/actions/            server actions por domínio
src/server/services/    project, validation, badge, certificate, notification, search
src/lib/                auth, session, permissions, storage, upload, slug, copy, pdf, qrcode...
src/components/         ui/, layout/, project/, event/, school/, badge/, certificate/, admin/, common/
```

Todo texto de interface fica em `src/lib/copy.ts` — nada de frase solta dentro de componente.

## Banco de dados

Entidades principais: `School`, `User` (+ `StudentProfile`, `TeacherProfile`), `Classroom`,
`Project`, `ProjectMember`, `ProjectEvidence`, `Skill`, `ProjectSkill`, `ProjectValidation`,
`Event`, `EventProject`, `Badge`, `UserBadge`, `Certificate`, `Notification`, `AuditLog`,
`PasswordResetToken`.

Fluxo de status do projeto:

```
DRAFT ──enviar──► SUBMITTED ──aprovar──────────► APPROVED ──arquivar──► ARCHIVED
                      │                              ▲
                      └──solicitar alterações──► CHANGES_REQUESTED ──reenviar──┘
```

- Visibilidade: `PRIVATE` · `SCHOOL` (padrão) · `PUBLIC` (opt-in explícito da equipe).
- Projeto fora de `APPROVED` só aparece para integrantes e para a equipe da escola.
- `EventProject` é a única fonte da relação projeto↔evento (um evento por projeto na v1).
- Usuário nunca é excluído: a administração desativa (`isActive = false`).

## Como rodar localmente

Pré-requisitos: Node 22+, npm 11+, Docker (ou um PostgreSQL 16 já disponível com o pacote
`contrib`, de onde vem a extensão `unaccent` usada pela busca — as imagens oficiais do Postgres
e o Postgres do Railway já a incluem).

```bash
# 1. Banco de dados (Postgres 16 na porta 5434)
docker compose up -d
# se o container trajetoria-postgres já existir, use: docker start trajetoria-postgres

# 2. Variáveis de ambiente
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"   # cole em AUTH_SECRET

# 3. Dependências
npm install

# 4. Banco: migrations + dados de demonstração
npm run db:migrate
npm run db:seed

# 5. Aplicação
npm run dev
```

Abra http://localhost:3000. Health check: http://localhost:3000/api/health.

Para recomeçar do zero (apaga **todos** os dados do banco de desenvolvimento):

```bash
npm run db:reset   # prisma migrate reset --force — roda as migrations e o seed de novo
```

Os uploads em desenvolvimento vão para `./.uploads` (fora de `public/`) e são servidos por
`/api/files/...`. A pasta está no `.gitignore`.

## Credenciais de demonstração

Senha de todos: `trajetoria123`

| Perfil | E-mail | Nome |
|---|---|---|
| Administração | `admin@horizonte.edu.br` | Beatriz Nogueira |
| Professor | `professor@horizonte.edu.br` | Carlos Menezes |
| Estudante | `joao@horizonte.edu.br` | João Silva — 2º A, Desenvolvimento de Sistemas |
| Estudante | `maria@horizonte.edu.br` | Maria Santos — 2º A, Desenvolvimento de Sistemas |
| Estudante | `ana@horizonte.edu.br` | Ana Oliveira — 2º B, Desenvolvimento de Sistemas |

> São credenciais **apenas de demonstração**. Em produção, rode o seed só se quiser a escola de
> exemplo e troque as senhas antes de liberar o acesso a qualquer pessoa.

## Roteiro de demonstração

Tour completo em ordem, cobrindo os critérios de entrega:

1. `npm run dev` — a aplicação sobe em http://localhost:3000.
2. Acesse `/login` e entre como **joao@horizonte.edu.br**.
3. `/dashboard` — "Olá, João.", contadores, projetos recentes e a linha do tempo "Minha trajetória".
4. `/projects/new` — crie um projeto (título, resumo, problema, solução, área, data, evento).
5. Na página do projeto, em **Equipe**, adicione Maria Santos com papel e contribuição.
6. Em **Competências**, declare Python e Comunicação.
7. Em **Evidências**, anexe um repositório (link) e/ou um PDF.
8. Clique em **Enviar para validação** — o projeto vai para `SUBMITTED`.
9. Saia e entre como **professor@horizonte.edu.br**; veja `/teacher` com "Aguardando você".
10. Abra o projeto e clique em **Aprovar**, preenchendo pontos fortes e comentário.
11. Ainda no painel do professor, marque as competências como **verificadas**.
12. Volte como João: o projeto aparece no portfólio `/u/joao.silva` com o selo "Projeto verificado
    pela escola".
13. Marque "Permitir que este projeto seja visualizado fora da escola" e abra `/projects/<slug>`
    em uma janela anônima.
14. Clique em **Ver QR Code** e baixe o PNG — ele aponta para a página pública do projeto.
15. `/events/hackathon-experimenta-2026` — descrição, quantidade de estudantes, destaques e
    projetos participantes. Sem sessão, a ficha do evento continua aberta: a lista de projetos
    respeita a visibilidade e a contagem de estudantes considera apenas o que está visível.
16. `/s/ee-conselheiro-crispiniano` — acervo da escola com busca e filtros de Ano, Área, Evento e Competência.
17. Como professor, conceda uma badge ao estudante (na página do projeto ou do perfil).
18. Ainda como professor, emita um certificado vinculado a evento/projeto; abra
    `/certificate/TRJ-2026-JOAOHACK` e baixe o PDF.
19. Entre como **admin@horizonte.edu.br** — `/admin` mostra os blocos com contagens.
20. Gerencie usuários (`/admin/users`), turmas, eventos, competências e badges.
21. `npm run db:migrate` aplica as migrations (`npm run db:deploy` em produção).
22. `npm run db:seed` recarrega os dados de demonstração (idempotente).
23. `npm run build` gera o build de produção sem erros.
24. A seção [Deploy no Railway](#deploy-no-railway) documenta a publicação ponta a ponta.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | String de conexão PostgreSQL. No Railway: `${{ Postgres.DATABASE_URL }}`. |
| `AUTH_SECRET` | sim | Segredo do Auth.js, mínimo 16 caracteres. |
| `AUTH_TRUST_HOST` | em produção | `true` atrás de proxy (Railway, Docker). |
| `APP_URL` | sim | URL pública; usada em QR Code, certificados e link de redefinição de senha. |
| `NEXT_PUBLIC_APP_URL` | não | Mesma URL, quando precisar no cliente. |
| `STORAGE_PROVIDER` | sim | `local` (desenvolvimento) ou `s3` (produção). |
| `S3_ENDPOINT` | com s3 | Endpoint do bucket (R2, MinIO) — vazio para AWS S3 padrão. |
| `S3_REGION` | com s3 | Região (`auto` no Cloudflare R2). |
| `S3_BUCKET` | com s3 | Nome do bucket. |
| `S3_ACCESS_KEY_ID` | com s3 | Chave de acesso. |
| `S3_SECRET_ACCESS_KEY` | com s3 | Chave secreta. |
| `S3_PUBLIC_URL` | com s3 | URL pública de leitura dos arquivos. |
| `TEST_DATABASE_URL` | só testes | Banco separado usado por `npm run test:db`. |

## Deploy no Railway

1. **Crie o projeto** no Railway e conecte o repositório (ou use `railway up`).
2. **Adicione o plugin PostgreSQL** (New → Database → PostgreSQL).
3. **Configure as variáveis** do serviço da aplicação:

   ```
   DATABASE_URL=${{ Postgres.DATABASE_URL }}
   AUTH_SECRET=<gere com: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">
   AUTH_TRUST_HOST=true
   APP_URL=https://<seu-dominio>.up.railway.app
   NEXT_PUBLIC_APP_URL=https://<seu-dominio>.up.railway.app
   STORAGE_PROVIDER=s3
   S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET=trajetoria
   S3_ACCESS_KEY_ID=<chave>
   S3_SECRET_ACCESS_KEY=<segredo>
   S3_PUBLIC_URL=https://arquivos.suaescola.com.br
   ```

4. **Build**: o `railway.json` já define `builder: DOCKERFILE`. O `Dockerfile` é multi-stage
   (node:22-alpine) e usa a saída `standalone` do Next. O estágio de build também roda
   `scripts/collect-prisma-runtime.mjs`, que copia o CLI do Prisma e suas dependências
   transitivas para a imagem final — é o que permite rodar `migrate deploy` no start.
5. **Migrations**: rodam no **start do container**, antes de o servidor subir. Tanto o
   `deploy.startCommand` do `railway.json` quanto o `CMD` do `Dockerfile` usam
   `sh -c "node node_modules/prisma/build/index.js migrate deploy && node server.js"`, então o
   comportamento é o mesmo no Railway e em qualquer outro runtime Docker. Nenhuma migration roda
   no build. Se o `migrate deploy` falhar, o `node server.js` não executa, o container não sobe,
   o health check não passa e o **deploy anterior continua ativo** — a versão nova só entra no ar
   com o banco já migrado.

   > Não use `deploy.preDeployCommand` no `railway.json`: o campo não é aplicado pelo Railway
   > (o serviço fica com `preDeployCommand: null`) e as migrations nunca rodariam.

6. **Health check**: `/api/health` (timeout de 120s, reinício `ON_FAILURE` com até 3 tentativas).
7. **Seed** (opcional, só na primeira publicação):

   ```bash
   railway run npm run db:seed
   ```

   `railway run` só funciona se o CLI conseguir resolver a `DATABASE_URL` do serviço. Quando
   isso falhar (ou quando for preciso aplicar uma migration manualmente, sem redeploy), abra um
   proxy TCP temporário para o Postgres:

   ```bash
   railway tcp-proxy create --service Postgres --port 5432
   # anote host e porta públicos devolvidos pelo comando
   DATABASE_URL="postgresql://postgres:<senha>@<host-publico>:<porta>/railway" npx prisma migrate deploy
   DATABASE_URL="postgresql://postgres:<senha>@<host-publico>:<porta>/railway" npm run db:seed
   railway tcp-proxy delete
   ```

   A senha e o nome do banco saem das variáveis do serviço Postgres. **Remova o proxy assim que
   terminar** — enquanto ele existir, o banco fica exposto na internet pública.

8. **Storage em produção é obrigatório**: o disco do container é efêmero. Com
   `STORAGE_PROVIDER=local` os arquivos enviados desaparecem no deploy seguinte. Exemplo de
   configuração no Cloudflare R2: crie o bucket, gere um token S3 com permissão de leitura e
   escrita, publique o bucket em um domínio (`S3_PUBLIC_URL`) e preencha as variáveis acima.

## Testes

```bash
npm test        # unitários (permissões, redirect, slug, upload, regras de projeto)
npm run test:db # integração: cria/migra o banco de teste e roda tests/integration
```

Os testes de integração precisam de um banco **separado**. Crie `.env.test` com:

```
TEST_DATABASE_URL="postgresql://trajetoria:trajetoria@localhost:5434/trajetoria_test"
```

`npm run test:db` cria o banco (se não existir), aplica as migrations e roda a suíte. O conteúdo
desse banco é apagado a cada execução. Se preferir criar o banco manualmente:

```bash
docker exec trajetoria-postgres psql -U trajetoria -d postgres -c "CREATE DATABASE trajetoria_test"
```

O que está coberto: matriz de visibilidade e permissões, bloqueio de open redirect, geração de
slug, allowlist/limites/magic bytes de upload, criação de projeto com dono e evento, isolamento
por escola nas listagens, envio e aprovação com notificação aos integrantes certos, bloqueio de
autovalidação e de badge entre escolas.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack). |
| `npm run build` / `npm start` | Build de produção e execução. |
| `npm run lint` / `npm run typecheck` | ESLint e TypeScript. |
| `npm test` / `npm run test:watch` | Testes unitários. |
| `npm run test:db` | Testes de integração com banco. |
| `npm run db:up` / `db:down` | Sobe/derruba o Postgres do docker-compose. |
| `npm run db:migrate` / `db:deploy` | Migrations em desenvolvimento / produção. |
| `npm run db:seed` | Dados de demonstração (idempotente). |
| `npm run db:reset` | Recria o banco de desenvolvimento e roda o seed. |
| `npm run db:studio` | Prisma Studio. |
| `node scripts/generate-icons.mjs` | Regera os ícones PWA a partir de `public/icon.svg`. |

## Segurança e privacidade

- **RBAC** em três perfis (STUDENT, TEACHER, ADMIN) com funções puras em `src/lib/permissions.ts`.
- **Isolamento por escola** aplicado no `where` das consultas e coberto por teste de integração.
- **Validação server-side** com Zod em toda action e route handler.
- **Senhas** com bcrypt (custo 12); mensagens de erro genéricas e rate limit no login, no upload e
  no download de certificado.
- **Uploads**: allowlist de MIME (PNG, JPEG, WebP, PDF), limite de 5 MB/10 MB, verificação de
  magic bytes, nome gerado por UUID, extensão derivada do MIME e chave sem travessia de diretório.
  Os arquivos ficam fora de `public/` e são servidos com `X-Content-Type-Options: nosniff`.
- **Cabeçalhos**: `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY` e `Permissions-Policy`.
- **LGPD**: perfil `PRIVATE` por padrão, projeto `SCHOOL` por padrão, publicação externa é opt-in
  explícito. E-mail nunca aparece em página pública, perfil ou card de equipe. A página `/privacy`
  explica em texto simples o que é registrado.
- Conteúdo escrito por usuários é renderizado como texto puro (`whitespace-pre-wrap`); não existe
  `dangerouslySetInnerHTML` no projeto.

## Roadmap

O que ficou de fora desta primeira versão, de propósito:

- SSO (Google Workspace / Microsoft 365) e login por e-mail institucional.
- Envio real de e-mail na redefinição de senha (hoje o link é registrado no log do servidor).
- Editor de texto rico na descrição do projeto.
- Notificações push e resumo por e-mail.
- Rate limit distribuído (Redis) — hoje é em memória e vale para uma réplica.
- Limpeza de arquivos órfãos no storage e antivírus nos uploads.
- Internacionalização (a interface é só em português).
- Exportação do portfólio completo em PDF.
- Comentários e conversa entre professor e equipe dentro do projeto.
- Mais de um evento por projeto e ranking oficial de evento (premiações).
- Importação de turmas e alunos por planilha.
