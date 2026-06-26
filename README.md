# Bolao do Heitor

PWA mobile-first para bolao de futebol com autenticacao por PIN, Pix manual, criacao de boloes por jogo ou por dia, apura--o autom-tica com football-data.org e ranking baseado apenas em participacao oficial confirmada.

## Stack

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- Postgres via `DATABASE_URL`
- PWA com `next-pwa`
- football-data.org no backend

## Arquitetura

- `src/app`: rotas App Router para jogador, admin, login e ranking publico.
- `src/actions`: server actions para autenticacao, gestao administrativa e fluxo do jogador.
- `src/lib`: autenticacao por sessoo, integracao com football-data.org, apura--o/ranking e helpers de dominio.
- `prisma/schema.prisma`: modelagem principal do sistema.
- `prisma/seed.ts`: seed inicial com admin.

## Regras principais implementadas

- Login simples por telefone/nome/apelido + PIN de 4 digitos.
- PIN salvo com hash (`bcryptjs`), nunca em texto puro.
- Sessoo em cookie `HttpOnly` assinado.
- Limite basico de tentativas com bloqueio tempor-rio.
- Admin cadastra manualmente jogadores e pode resetar PIN.
- Jogador inativo nao acessa o sistema.
- Bolao por jogo (`GAME`) e bolao do dia (`DAY`).
- Fluxo Pix manual com `PENDING`, `WAITING_CONFIRMATION`, `CONFIRMED`, `REJECTED`.
- Ranking oficial considera apenas entradas com pagamento confirmado e palpites completos.
- Palpites travam por jogo no horario de inicio e respeitam cutoff geral, quando configurado.
- Palpites dos outros so aparecem apos o inicio do jogo.
- Apura--o autom-tica com score exato, acerto de vencedor/empate e desempate por erro total de gols.
- Caixa com casa padrao em 30% e premiacao em 70%.
- Historico, Hall da Fama e auditoria b-sica.

## Modelos Prisma

Principais entidades:

- `User`
- `Session`
- `AdminSettings`
- `Match`
- `Pool`
- `PoolMatch`
- `PoolEntry`
- `Prediction`
- `PoolRanking`
- `AuditLog`

## Vari-veis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/bolao"
FOOTBALL_DATA_API_KEY="coloque_sua_chave_aqui"
SESSION_SECRET="gere_uma_string_segura"
NEXT_PUBLIC_APP_NAME="Bolao do Heitor"
```

`.env.local` nao deve ser commitado.

## Rodando localmente

1. Instale dependencias:

```bash
npm install
```

2. Gere o client Prisma:

```bash
npx prisma generate
```

3. Rode a migration no seu Postgres:

```bash
npx prisma migrate dev --name init
```

4. Rode o seed inicial:

```bash
npx prisma db seed
```

5. Suba o ambiente local:

```bash
npm run dev
```

6. Acesse:

- Jogador: `http://localhost:3000/entrar`
- Admin: `http://localhost:3000/admin/entrar`

## Admins iniciais

O seed cria ou atualiza dois administradores fixos:

- Heitor: telefone/nome `Heitor` ou `00000000000`, PIN `0000`
- Vinicius: telefone/nome `Vinicius` ou `99999999999`, PIN `9999`

Depois disso, um desses admins cria os jogadores e passa nome/apelido + PIN para cada um.

## Banco e migrations

- Schema: [prisma/schema.prisma](./prisma/schema.prisma)
- Migration inicial: [prisma/migrations/20260625190000_init/migration.sql](./prisma/migrations/20260625190000_init/migration.sql)
- Seed: [prisma/seed.ts](./prisma/seed.ts)

## football-data.org

Todas as chamadas soo feitas exclusivamente no backend.

Configura--o usada:

- Base URL: `https://api.football-data.org/v4`
- Header: `X-Auth-Token: process.env.FOOTBALL_DATA_API_KEY`

Tela admin de jogos:

- busca por dia
- busca por intervalo
- filtro por competicao
- filtro por status
- salvamento local dos jogos selecionados

## Deploy na Vercel

1. Suba o projeto para um repositorio Git.
2. Importe `apps/bolao-do-heitor` na Vercel como root do projeto.
3. Crie um banco Postgres pelo Vercel Marketplace, preferencialmente Prisma Postgres ou Neon.
4. Copie a `DATABASE_URL` para as variaveis do projeto.
5. Configure tambem:

```env
FOOTBALL_DATA_API_KEY=...
SESSION_SECRET=...
NEXT_PUBLIC_APP_NAME=Bolao do Heitor
ADMIN_NAME=...
ADMIN_PHONE=...
ADMIN_PIN=...
```

6. Antes do primeiro deploy util, rode migration e seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

7. Fa-a o deploy.

## Conectando banco pelo Vercel Marketplace

### Prisma Postgres

- Crie o banco no Marketplace.
- Copie a `DATABASE_URL` exibida pela Vercel.
- Use essa URL nas variaveis do projeto e localmente.

### Neon

- Instale a integracao Neon pela Vercel.
- Use a `DATABASE_URL` fornecida.
- Execute `prisma migrate deploy` no ambiente.

## Comandos -teis

```bash
npm run dev
npm run lint
npm run build
npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate deploy
npx prisma db seed
```

## O que foi implementado

- PWA base com manifest, icone e service worker.
- Area p-blica de login para jogador e admin.
- Area do jogador com dashboard, boloes, meus boloes, ranking, historico e perfil.
- Area admin com dashboard, jogadores, jogos, boloes, pagamentos, caixa, historico, configuracoes e auditoria.
- Gera--o de QR Code a partir do Pix Copia e Cola.
- Persistencia de jogos locais e sincroniza--o com football-data.org.
- Apura--o e ranking persistidos em `PoolRanking`.
- Ranking publico por bolao encerrado.

## O que ainda pode melhorar

- Toasts de sucesso/erro mais refinados em todas as actions.
- Edicao completa de jogador e bolao em vez de fluxo mais direto.
- Exportacao CSV de ranking e caixa.
- Compartilhamento otimizado para WhatsApp.
- Regras mais detalhadas para empate tecnico e divisao de premio empatado.
- Testes automatizados do dominio de apura--o e autenticacao.
- Observabilidade e alertas operacionais de producao.
