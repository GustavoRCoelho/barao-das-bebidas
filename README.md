<p align="center">
  <img src="./public/logo.png" alt="Logo Barão das Bebidas" width="120" />
</p>

# Barão das Bebidas

Sistema web para operação de pedidos da loja, com experiência para **cliente** e **admin**.
Construído com **Next.js 16 (App Router)**, **TypeScript** e **Supabase**.

## Sumário

- Visão geral
- Funcionalidades
- Relatórios (admin)
- Categorias e produtos (referência técnica)
- Arquitetura do projeto
- Stack e dependências
- Requisitos
- Configuração do ambiente
- Executando o projeto
- Scripts disponíveis
- Testes E2E (Cypress)
- Endpoints da API
- Regras de acesso (RBAC)
- Sessão e segurança
- Estrutura de pastas
- Melhorias recentes de UX

## Visão geral

O projeto permite:

- clientes criarem pedidos e acompanharem status em tempo real;
- admins gerenciarem **produtos, estoque, categorias**, pedidos, relatórios e permissões de usuários;
- operação com autenticação própria baseada em sessão HTTP-only;
- feedback de ações com toast (`sonner`) para create/update/delete.

## Funcionalidades

### Área pública / autenticação

- Cadastro com validação de nome, email e senha.
- Login com sessão persistida via cookie.
- Logout com confirmação em modal.

### Cliente

- Criação de pedido com:
  - dados de entrega,
  - seleção de itens do cardápio em modal,
  - **filtros por categoria** (chips: Todas, Sem categoria, por nome da categoria) e busca por nome,
  - **favoritos** (coração em cada produto) e filtro **“Só favoritos”** quando logado,
  - resumo antes da confirmação final,
  - validação de campos obrigatórios (incluindo telefone formatado).
- **Cardápio** (visualização): mesmos filtros por categoria e busca; badge com categoria no card; **favoritar** produtos e filtrar apenas favoritados (usuário autenticado).
- Acompanhamento de pedidos com:
  - cards visuais,
  - trilha de status por etapa,
  - busca no servidor com debounce,
  - **paginação** (tamanho da página configurável),
  - resumo no período conforme o filtro aplicado.

### Admin

- Gerenciamento de pedidos:
  - alteração de status,
  - exclusão,
  - indicadores de rastreio por status,
  - **listagem paginada** com busca no servidor (`cliente`, item, descrição),
  - cartões de totais (pedidos, em aberto, entregues, receita) refletem o conjunto filtrado, não só a página atual.
- **Produtos e estoque** (menu da sidebar; tela “Produtos, estoque e categorias”):
  - CRUD de **categorias** (nome único no banco; exclusão desvincula produtos com `ON DELETE SET NULL`);
  - CRUD de produtos com **categoria opcional**, preço, estoque e foto;
  - seções **Categorias** e **Produtos e estoque** podem ser **recolhidas**; preferência salva em `localStorage` (abertas por padrão);
  - tabela de produtos com **paginação no cliente** (filtro por nome e quantidade aplicado antes de paginar).
- Gerenciamento de usuários:
  - alteração de role (`admin` / `cliente`),
  - **listagem paginada** com filtros opcionais por nome e e-mail no servidor.
- Relatórios e indicadores:
  - aba exclusiva para **admin** (API e interface);
  - filtros de período: hoje, semana, mês e intervalo personalizado;
  - cartões com resumo (pedidos, receita, ticket médio, unidades);
  - gráficos com **Recharts** (receita ao longo do tempo, pedidos por status, volume diário, top itens, **receita por categoria** do produto vinculado ao pedido);
  - cores de status alinhadas ao tema (`--chart-status-*` em `globals.css`);
  - estado de carregamento com componente dedicado (`atoms/pedidos-list-loading.tsx`) nas listagens de pedidos e usuários.

### UX/UI

- Design responsivo com foco mobile.
- Sidebar em modo gaveta no celular.
- Feedback com toasts de sucesso/erro para operações críticas.
- Tema e componentes base com `shadcn` + Tailwind.

## Relatórios (admin)

- Rota de agregação: `GET /api/relatorios?inicio=<ISO>&fim=<ISO>` — apenas admin autenticado.
- Dados calculados a partir de `pedidos` no intervalo: resumo, série diária, distribuição por status, ranking de itens, **`porCategoria`** (join `pedidos` → `produtos` → `categorias`; buckets para pedidos sem produto ou sem categoria quando aplicável).
- UI: `atoms/relatorios-dashboard.tsx`, estado em `hooks/use-relatorios-tab.ts`, tipos em `lib/relatorios.ts`.

## Categorias e produtos (referência técnica)

- Tabela `categorias`; `produtos.categoria_id` opcional com FK e `ON DELETE SET NULL`.
- **Favoritos por usuário:** tabela `produto_favoritos` (`usuario_id`, `produto_id`, unicidade do par, `ON DELETE CASCADE` nas FKs). API em `app/api/favoritos/route.ts`; cliente em `hooks/use-favoritos-produtos.ts`; botão reutilizável `atoms/botao-favorito-produto.tsx` no cardápio (`atoms/cardapio-table.tsx`) e no modal do pedido (`atoms/pedido-form.tsx`).
- UI admin: `atoms/gerenciar-produtos-estoque.tsx`; filtros reutilizáveis no cardápio e no pedido: `atoms/categoria-filtro-chips.tsx`.
- Tipos: `lib/categorias.ts`, `lib/produtos.ts` (produto inclui `categoria_id` e objeto `categoria` resumido quando o join vem da API).
- `useCardapioTab` carrega **produtos** e **categorias** em paralelo; favoritos são carregados à parte quando há sessão.

## Arquitetura do projeto

Padrão principal:

- `app/`: rotas de página e APIs (App Router).
- `atoms/`: componentes de interface específicos de domínio.
- `hooks/`: regras de negócio no cliente (fetch, estados e mutações).
- `lib/`: contratos de domínio, autenticação, utilitários e integração Supabase.

Fluxo típico:

1. componente em `atoms/` dispara ação;
2. `hook` correspondente executa request para `app/api/*`;
3. rota API valida sessão/role e persiste no Supabase;
4. retorno atualiza estado local e exibe toast.

## Stack e dependências

### Principais

- `next@16.2.1`
- `react@19.2.4`
- `typescript@5`
- `tailwindcss@4`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `sonner`
- `lucide-react`
- `recharts` / `date-fns` / `react-day-picker` (relatórios e datas)

### UI

- `shadcn`
- `radix-ui`
- `class-variance-authority`
- `tailwind-merge`
- `tw-animate-css`

### Desenvolvimento / QA

- `cypress` (testes end-to-end no navegador)

## Requisitos

- Node.js 20+ (recomendado)
- npm 10+
- projeto Supabase configurado

## Configuração do ambiente

1. Instale as dependências:

```bash
npm install
```

2. Crie/atualize o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

3. Execute o SQL inicial no Supabase (SQL Editor):

- `supabase/schema.sql`

> O script cria tabelas (`usuarios`, `auth_sessions`, `pedidos`, `produtos`, **`categorias`**, **`produto_favoritos`**), relacionamento **produto → categoria**, vínculo **usuário ↔ produto** para favoritos, constraints e políticas RLS usadas no fluxo atual.

## Executando o projeto

```bash
npm run dev
```

Aplicação local:

- [http://localhost:3000](http://localhost:3000)

Ambiente de produção:

- [https://barao-das-bebidas.vercel.app/auth](https://barao-das-bebidas.vercel.app/auth)

## Scripts disponíveis

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de produção
- `npm run start`: sobe build de produção
- `npm run lint`: validação com ESLint
- `npm run cypress:open`: abre o Cypress em modo interativo (ideal para demonstrar o fluxo na janela do runner)
- `npm run cypress:run` ou `npm run test:e2e`: executa os testes E2E em modo headless (terminal)

## Testes E2E (Cypress)

- Configuração: `cypress.config.ts` (`baseUrl`: `http://localhost:3000`).
- Spec principal: `cypress/e2e/jornada-cliente.cy.ts` — fluxo **cadastro** (e-mail único `@gmail.com`, senha `123123`) → **logout** → **login** → **cardápio** (favoritar um produto) → **pedido** com três produtos no modal → **confirmar** → **acompanhar pedidos**.
- Suporte: `cypress/support/e2e.ts` (tratamento leve de exceções não críticas, ex.: `ResizeObserver`).

**Como rodar (modo janela):** em um terminal `npm run dev`; em outro `npm run cypress:open` → **E2E Testing** → escolha o spec → **Run**.

**Pré-requisitos do spec:** Supabase acessível (mesmo `.env.local` do app) e **pelo menos três produtos com estoque ≥ 1** no cardápio (a API valida estoque ao criar o pedido).

**Página `/auth` (cadastro):** há `data-testid` nos gatilhos das abas (`auth-tab-login`, `auth-tab-cadastro`), no formulário (`auth-form-cadastro`) e no campo nome (`auth-input-nome`). O painel de cadastro usa `forceMount` no `TabsContent` (Radix) para o formulário permanecer no DOM e os testes/localizadores ficarem estáveis.

## Endpoints da API

### Autenticação

- `POST /api/auth/register` - cria usuário e inicia sessão
- `POST /api/auth/login` - autentica usuário
- `POST /api/auth/logout` - encerra sessão
- `GET /api/auth/me` - retorna usuário autenticado

### Pedidos

- `GET /api/pedidos` - lista pedidos (**admin**), com **paginação e busca**:
  - query: `page` (default 1), `pageSize` (5–50, default 10), `q` (opcional, filtra cliente, item e descrição com `ILIKE`);
  - corpo JSON: `{ pedidos, total, page, pageSize, resumo }`, onde `resumo` agrega **todo** o conjunto filtrado (total de pedidos, em aberto, entregues, receita).
- `POST /api/pedidos` - cria pedido (cliente/admin autenticado)
- `PATCH /api/pedidos/:id` - atualiza pedido (admin)
- `DELETE /api/pedidos/:id` - remove pedido (admin)
- `GET /api/pedidos/me` - pedidos do usuário logado (**paginação**):
  - query: `page`, `pageSize`, `q` (opcional; também busca em `observacao`);
  - corpo: `{ pedidos, total, page, pageSize, resumo }` no mesmo padrão.

### Relatórios

- `GET /api/relatorios` - agregados do período (`inicio`, `fim` em ISO 8601; **admin**). Resposta inclui `porCategoria[]` (receita, pedidos e unidades por categoria ou rótulos especiais quando não há vínculo).

### Produtos

- `GET /api/produtos` - lista produtos (autenticado), com join `categoria` quando existir
- `POST /api/produtos` - cria produto (admin); corpo aceita `categoria_id` opcional
- `PATCH /api/produtos/:id` - atualiza produto (admin); pode definir ou limpar `categoria_id`
- `DELETE /api/produtos/:id` - remove produto (admin)

### Categorias

- `GET /api/categorias` - lista categorias (autenticado), ordenadas por nome
- `POST /api/categorias` - cria categoria (admin)
- `PATCH /api/categorias/:id` - atualiza nome (admin)
- `DELETE /api/categorias/:id` - exclui categoria (admin); produtos perdem o vínculo

### Favoritos (produtos)

- `GET /api/favoritos` - lista IDs de produtos favoritados pelo usuário da sessão; resposta `{ produto_ids: string[] }` (**autenticado**)
- `POST /api/favoritos` - adiciona favorito; corpo `{ produto_id: string }`; idempotente se já existir (**autenticado**)
- `DELETE /api/favoritos?produto_id=<uuid>` - remove o favorito (**autenticado**)

### Usuários

- `GET /api/usuarios` - lista usuários (**admin**) com **paginação**:
  - query: `page`, `pageSize`, `nome`, `email` (opcionais; filtros `ILIKE` independentes);
  - corpo: `{ usuarios, total, page, pageSize }` (campos `id`, `nome`, `email`, `role`).
- `PATCH /api/usuarios/:id` - altera role (admin)

## Regras de acesso (RBAC)

- `cliente`:
  - criar pedidos
  - acompanhar os próprios pedidos
  - favoritar produtos (cardápio e pedido); lista salva por usuário em `produto_favoritos`
- `admin`:
  - tudo de cliente
  - gerenciar pedidos, produtos, usuários e **relatórios** (aba e API restritas a admin)

Regra de bootstrap:

- o primeiro usuário cadastrado vira `admin`;
- os próximos viram `cliente`.

## Sessão e segurança

- Sessão por cookie HTTP-only (`bb_session`), com validade de 7 dias.
- Tokens de sessão armazenados como hash SHA-256 em `auth_sessions`.
- Senha protegida com PBKDF2 (`120000` iterações + salt aleatório).
- Proteção de rotas em `proxy.ts`:
  - sem sessão: redireciona para `/auth` (ou `401` para API)
  - com sessão em `/auth`: redireciona para `/`

## Estrutura de pastas

```text
app/
  api/
    auth/
    favoritos/
    pedidos/
    relatorios/
    produtos/
    categorias/
    usuarios/
  auth/
  layout.tsx
  page.tsx
atoms/
cypress/
  e2e/
  support/
hooks/
lib/          # inclui pedidos-listagem.ts, relatorios.ts, usuarios-admin.ts, etc.
public/
supabase/
cypress.config.ts
README.md
```

## Melhorias recentes de UX

- Responsividade mobile para login e painel.
- Confirmação em modal para logout.
- Confirmação em modal com resumo antes de enviar pedido.
- Toasts globais (`sonner`) para sucesso/erro em create/update/delete.
- Painel de **relatórios** com card de filtros, gráficos com legenda e paleta por status (não monocromática); **receita por categoria**.
- **Categorias** dinâmicas (sem lista fixa no código): filtros em cardápio e no modal do pedido; admin com CRUD de categorias e atribuição por produto.
- Painel admin **Produtos e estoque**: blocos recolhíveis com estado persistido no **localStorage** (padrão expandido); **paginação** na tabela de produtos após filtros locais.
- **Paginação** em **Gerenciar pedidos**, **Acompanhar pedidos** e **Gerenciar usuários** (API); refetch silencioso após ações para não bloquear a tabela com loading completo quando faz sentido.
- Tabelas administrativas com **estilo unificado** (cabeçalho `muted/50`, borda arredondada na área rolável, tipografia consistente com a grade de produtos).
- **Produtos favoritos** por usuário (`produto_favoritos` no banco): favoritar na aba **Cardápio** e no **modal do pedido**, com filtro **“Só favoritos”**; persistência via `/api/favoritos` e estado em `useFavoritosProdutos`.
- **Cardápio:** estado de carregamento dedicado (`atoms/cardapio-loading.tsx`) enquanto `useCardapioTab` busca produtos e categorias.
- **Testes E2E** com Cypress (`cypress/e2e/jornada-cliente.cy.ts`), incluindo fluxo completo de cliente para demonstração no runner.
