<p align="center">
  <img src="./public/logo.png" alt="Logo Barão das Bebidas" width="120" />
</p>

# Barão das Bebidas

Sistema web para operação de pedidos da loja, com experiência para **cliente** e **admin**.
Construído com **Next.js 16 (App Router)**, **TypeScript** e **Supabase**.

## Sumário

- Visão geral
- Funcionalidades
- Arquitetura do projeto
- Stack e dependências
- Requisitos
- Configuração do ambiente
- Executando o projeto
- Scripts disponíveis
- Endpoints da API
- Regras de acesso (RBAC)
- Sessão e segurança
- Estrutura de pastas
- Melhorias recentes de UX

## Visão geral

O projeto permite:

- clientes criarem pedidos e acompanharem status em tempo real;
- admins gerenciarem cardápio, pedidos e permissões de usuários;
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
  - resumo antes da confirmação final,
  - validação de campos obrigatórios (incluindo telefone formatado).
- Acompanhamento de pedidos com:
  - cards visuais,
  - trilha de status por etapa,
  - busca e resumo.

### Admin

- Gerenciamento de pedidos:
  - alteração de status,
  - exclusão,
  - indicadores de rastreio por status.
- Gerenciamento de cardápio:
  - criar, editar e excluir produtos.
- Gerenciamento de usuários:
  - alteração de role (`admin` / `cliente`).

### UX/UI

- Design responsivo com foco mobile.
- Sidebar em modo gaveta no celular.
- Feedback com toasts de sucesso/erro para operações críticas.
- Tema e componentes base com `shadcn` + Tailwind.

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

### UI

- `shadcn`
- `radix-ui`
- `class-variance-authority`
- `tailwind-merge`
- `tw-animate-css`

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

> O script cria tabelas, constraints e políticas necessárias para o fluxo atual.

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

## Endpoints da API

### Autenticação

- `POST /api/auth/register` - cria usuário e inicia sessão
- `POST /api/auth/login` - autentica usuário
- `POST /api/auth/logout` - encerra sessão
- `GET /api/auth/me` - retorna usuário autenticado

### Pedidos

- `GET /api/pedidos` - lista pedidos (admin)
- `POST /api/pedidos` - cria pedido (cliente/admin autenticado)
- `PATCH /api/pedidos/:id` - atualiza pedido (admin)
- `DELETE /api/pedidos/:id` - remove pedido (admin)
- `GET /api/pedidos/me` - pedidos do usuário logado

### Produtos

- `GET /api/produtos` - lista produtos autenticado
- `POST /api/produtos` - cria produto (admin)
- `PATCH /api/produtos/:id` - atualiza produto (admin)
- `DELETE /api/produtos/:id` - remove produto (admin)

### Usuários

- `GET /api/usuarios` - lista usuários (admin)
- `PATCH /api/usuarios/:id` - altera role (admin)

## Regras de acesso (RBAC)

- `cliente`:
  - criar pedidos
  - acompanhar os próprios pedidos
- `admin`:
  - tudo de cliente
  - gerenciar pedidos, produtos e usuários

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
    pedidos/
    produtos/
    usuarios/
  auth/
  layout.tsx
  page.tsx
atoms/
hooks/
lib/
public/
supabase/
README.md
```

## Melhorias recentes de UX

- Responsividade mobile para login e painel.
- Confirmação em modal para logout.
- Confirmação em modal com resumo antes de enviar pedido.
- Toasts globais (`sonner`) para sucesso/erro em create/update/delete.
