# Barão das Bebidas - Cadastro de Pedidos

Sistema web com **Next.js (App Router)** + **TypeScript** + **Supabase** para cadastrar e acompanhar pedidos da distribuidora.

## Tecnologias

- Next.js com App Router
- TypeScript
- API Routes no proprio projeto (`app/api`)
- Supabase como banco de dados
- Cadastro e login de usuario com senha protegida por hash (PBKDF2)
- Niveis de permissao: `admin` e `cliente`

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

2. Crie/atualize seu `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

3. No painel do Supabase (SQL Editor), execute o script:

- `supabase/schema.sql`

4. Rode o projeto:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Endpoints da API

- `POST /api/auth/register` - cadastro de usuario com hash de senha
- `POST /api/auth/login` - login
- `POST /api/auth/logout` - logout
- `GET /api/auth/me` - usuario autenticado
- `GET /api/pedidos` - lista pedidos
- `POST /api/pedidos` - cria pedido
- `PATCH /api/pedidos/:id` - atualiza pedido (ex: status)
- `DELETE /api/pedidos/:id` - remove pedido

## Permissoes

- `cliente`: pode criar pedidos
- `admin`: pode criar e gerenciar pedidos (listar, editar status e excluir)

No cadastro, o primeiro usuario criado vira `admin`. Os proximos sao `cliente`.

## Observacao sobre seguranca

O projeto esta configurado para funcionar com a chave publishable (anon).  
As politicas de `supabase/schema.sql` permitem operacoes para o papel `anon` para facilitar o inicio rapido.

As senhas **nao** sao salvas em texto puro: o backend usa PBKDF2 com salt aleatorio.
