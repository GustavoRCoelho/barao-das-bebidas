create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  senha_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.usuarios
add column if not exists role text not null default 'cliente';

alter table public.usuarios
drop constraint if exists usuarios_role_check;

alter table public.usuarios
add constraint usuarios_role_check check (role in ('admin', 'cliente'));

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete set null,
  produto_id uuid,
  cliente text not null,
  telefone text,
  endereco text,
  item text not null,
  descricao text,
  quantidade integer not null check (quantidade > 0),
  valor_total numeric(10, 2) not null check (valor_total >= 0),
  status text not null default 'pendente' check (status in ('pendente', 'separacao', 'enviado', 'entregue')),
  observacao text,
  created_at timestamptz not null default now()
);

alter table public.pedidos
add column if not exists usuario_id uuid references public.usuarios(id) on delete set null;

alter table public.pedidos
add column if not exists produto_id uuid references public.produtos(id) on delete set null;

alter table public.pedidos
add column if not exists descricao text;

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco numeric(10, 2) not null default 0 check (preco >= 0),
  quantidade_estoque integer not null default 0 check (quantidade_estoque >= 0),
  foto_url text,
  created_at timestamptz not null default now()
);

alter table public.produtos
add column if not exists descricao text;

alter table public.produtos
add column if not exists preco numeric(10, 2) not null default 0;

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);

alter table public.produtos
add column if not exists categoria_id uuid references public.categorias(id) on delete set null;

create table if not exists public.produto_favoritos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (usuario_id, produto_id)
);

create index if not exists produto_favoritos_usuario_id_idx on public.produto_favoritos (usuario_id);
create index if not exists produto_favoritos_produto_id_idx on public.produto_favoritos (produto_id);

alter table public.pedidos enable row level security;
alter table public.usuarios enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.produtos enable row level security;
alter table public.categorias enable row level security;
alter table public.produto_favoritos enable row level security;

drop policy if exists "Anon pode ler pedidos" on public.pedidos;
drop policy if exists "Anon pode criar pedidos" on public.pedidos;
drop policy if exists "Anon pode editar pedidos" on public.pedidos;
drop policy if exists "Anon pode remover pedidos" on public.pedidos;
drop policy if exists "Anon pode criar usuarios" on public.usuarios;
drop policy if exists "Anon pode ler usuarios por email" on public.usuarios;
drop policy if exists "Anon pode ler usuarios por id" on public.usuarios;
drop policy if exists "Anon pode editar usuarios" on public.usuarios;
drop policy if exists "Anon pode criar sessoes" on public.auth_sessions;
drop policy if exists "Anon pode ler sessoes" on public.auth_sessions;
drop policy if exists "Anon pode remover sessoes" on public.auth_sessions;
drop policy if exists "Anon pode ler produtos" on public.produtos;
drop policy if exists "Anon pode criar produtos" on public.produtos;
drop policy if exists "Anon pode editar produtos" on public.produtos;
drop policy if exists "Anon pode remover produtos" on public.produtos;

create policy "Anon pode ler pedidos"
on public.pedidos
for select
to anon
using (true);

create policy "Anon pode criar pedidos"
on public.pedidos
for insert
to anon
with check (true);

create policy "Anon pode editar pedidos"
on public.pedidos
for update
to anon
using (true)
with check (true);

create policy "Anon pode remover pedidos"
on public.pedidos
for delete
to anon
using (true);

create policy "Anon pode criar usuarios"
on public.usuarios
for insert
to anon
with check (true);

create policy "Anon pode ler usuarios por email"
on public.usuarios
for select
to anon
using (true);

create policy "Anon pode ler usuarios por id"
on public.usuarios
for select
to anon
using (true);

create policy "Anon pode editar usuarios"
on public.usuarios
for update
to anon
using (true)
with check (true);

create policy "Anon pode criar sessoes"
on public.auth_sessions
for insert
to anon
with check (true);

create policy "Anon pode ler sessoes"
on public.auth_sessions
for select
to anon
using (true);

create policy "Anon pode remover sessoes"
on public.auth_sessions
for delete
to anon
using (true);

create policy "Anon pode ler produtos"
on public.produtos
for select
to anon
using (true);

create policy "Anon pode criar produtos"
on public.produtos
for insert
to anon
with check (true);

create policy "Anon pode editar produtos"
on public.produtos
for update
to anon
using (true)
with check (true);

create policy "Anon pode remover produtos"
on public.produtos
for delete
to anon
using (true);

drop policy if exists "Anon pode ler categorias" on public.categorias;
drop policy if exists "Anon pode criar categorias" on public.categorias;
drop policy if exists "Anon pode editar categorias" on public.categorias;
drop policy if exists "Anon pode remover categorias" on public.categorias;

create policy "Anon pode ler categorias"
on public.categorias
for select
to anon
using (true);

create policy "Anon pode criar categorias"
on public.categorias
for insert
to anon
with check (true);

create policy "Anon pode editar categorias"
on public.categorias
for update
to anon
using (true)
with check (true);

create policy "Anon pode remover categorias"
on public.categorias
for delete
to anon
using (true);

grant select, insert, update, delete on public.produtos to anon;

grant select, insert, update, delete on public.categorias to anon;

grant select, insert, update on public.usuarios to anon;

drop policy if exists "Anon pode ler favoritos" on public.produto_favoritos;
drop policy if exists "Anon pode criar favoritos" on public.produto_favoritos;
drop policy if exists "Anon pode remover favoritos" on public.produto_favoritos;

create policy "Anon pode ler favoritos"
on public.produto_favoritos
for select
to anon
using (true);

create policy "Anon pode criar favoritos"
on public.produto_favoritos
for insert
to anon
with check (true);

create policy "Anon pode remover favoritos"
on public.produto_favoritos
for delete
to anon
using (true);

grant select, insert, delete on public.produto_favoritos to anon;
