# Apresentacao do Projeto - Barao das Bebidas (Temporario)

Este arquivo foi criado como apoio rapido para apresentacao ao professor.

## 1) Abertura (30-40s)

"Meu projeto se chama **Barao das Bebidas**.
Ele e um sistema web para gestao de pedidos, com dois perfis de acesso: **cliente** e **admin**.
Foi desenvolvido com **Next.js 16 (App Router)**, **TypeScript** e **Supabase**.
O objetivo principal e digitalizar o fluxo da loja: cadastro/autenticacao, criacao de pedidos, controle de estoque, administracao do sistema e **visao consolidada em relatorios** para o admin."

## 2) Problema e Objetivo

- Problema: processo de pedido manual, sem visao clara de status e sem controle centralizado.
- Objetivo: criar uma plataforma unica para:
  - clientes realizarem e acompanharem pedidos;
  - admins gerenciarem pedidos, produtos, usuarios e **relatorios com graficos**;
  - manter seguranca com autenticacao e controle de acesso.

## 3) Funcionalidades Principais

### Cliente
- Cadastro e login.
- Criacao de pedido com validacoes.
- Selecao de itens e resumo antes da confirmacao.
- Acompanhamento de status do pedido.

### Admin
- Gerenciamento de pedidos (listar, atualizar status, excluir).
- Gerenciamento de produtos (CRUD).
- Gerenciamento de usuarios (alterar `role`).
- **Relatorios** (so admin):
  - ultima aba do menu;
  - filtros: hoje, semana, mes, periodo personalizado (card branco com datas);
  - indicadores e graficos (receita no tempo, pizza por status, barras de volume, top itens);
  - cores de status consistentes (pendente, separacao, enviado, entregue).

## 4) Arquitetura da Solucao

- Frontend e backend no Next.js (App Router).
- API Routes em `app/api/*`.
- Banco no Supabase (PostgreSQL).
- Organizacao por camadas:
  - `atoms/` (UI),
  - `hooks/` (estado/mutacoes),
  - `lib/` (regras de dominio, autenticacao, integracao Supabase).

Fluxo tecnico:
1. Componente dispara acao.
2. Hook chama endpoint em `app/api`.
3. API valida sessao/role.
4. Persiste no Supabase.
5. Retorna resposta e exibe toast.

## 5) Modelo de Dados

Tabelas principais:
- `usuarios` (id, nome, email, role, senha_hash)
- `auth_sessions` (user_id, token_hash, expires_at)
- `produtos` (nome, preco, quantidade_estoque, foto_url)
- `pedidos` (usuario_id, produto_id, item, quantidade, valor_total, status)

Regras importantes:
- `role` com check (`admin`/`cliente`)
- validacoes de quantidade/preco/valor
- status controlado (`pendente`, `separacao`, `enviado`, `entregue`)

## 6) Autenticacao e Seguranca

- Usa **sessao stateful com cookie HTTP-only** (`bb_session`).
  - Explicacao simples para falar na apresentacao:
    - "Sessao stateful" significa que o servidor guarda o estado da sessao no banco.
    - Em outras palavras: o sistema precisa consultar o banco para confirmar se a sessao ainda existe e esta valida.
    - O navegador guarda um identificador da sessao no cookie, e o backend valida esse identificador.
- No login:
  1. valida senha (PBKDF2 + salt),
  2. gera token aleatorio,
  3. armazena no banco apenas o `SHA-256` do token em `auth_sessions`,
  4. envia token no cookie.
- Explicacao simples para os termos:
  - **PBKDF2**: algoritmo para "embaralhar" senha de forma forte.
  - **Salt**: valor aleatorio que deixa cada hash de senha unico.
  - **SHA-256 do token**: o token original nao fica salvo em texto puro no banco; somente sua "impressao digital".
- Em cada requisicao protegida:
  - le cookie,
  - calcula hash,
  - consulta sessao no banco e validade.

Pontos fortes:
- cookie HTTP-only (mitiga acesso via JavaScript),
- senha com hash forte (PBKDF2),
- sessao expira (7 dias),
- RBAC por `role` na API.

## 7) RBAC e Protecao de Rotas

- `cliente`: cria pedido e acompanha os proprios pedidos.
- `admin`: gerencia pedidos, produtos, usuarios e **relatorios** (aba escondida para cliente; API retorna 403 se nao for admin).
- Explicacao simples:
  - **RBAC** (Role-Based Access Control) e o controle de acesso por perfil.
  - Aqui, a regra e: cada perfil tem permissoes diferentes e a API valida isso antes de executar a acao.
- `proxy.ts`:
  - sem sessao: bloqueia paginas protegidas (ou retorna 401 em API);
  - com sessao tentando entrar em `/auth`: redireciona para `/`.

## 8) Endpoints Principais

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Pedidos: `GET /api/pedidos`, `POST /api/pedidos`, `PATCH /api/pedidos/:id`, `DELETE /api/pedidos/:id`, `GET /api/pedidos/me`
- Produtos: `GET /api/produtos`, `POST /api/produtos`, `PATCH /api/produtos/:id`, `DELETE /api/produtos/:id`
- Usuarios: `GET /api/usuarios`, `PATCH /api/usuarios/:id`
- Relatorios: `GET /api/relatorios?inicio=<ISO>&fim=<ISO>` (admin; agrega pedidos no intervalo)

Frase curta para falar na hora:
- "O backend recebe duas datas em ISO, busca os pedidos no Supabase e devolve resumo, serie por dia, contagem por status e ranking de itens — tudo no servidor para o grafico so consumir."

## 9) UX e Qualidade da Experiencia

- Layout responsivo (foco mobile).
- Confirmacoes em modal (logout e envio de pedido).
- Feedback imediato com toasts (`sonner`).
- Componentizacao com `shadcn` + Tailwind.
- Graficos com `recharts`, legendas e paleta por status (CSS vars `--chart-status-*`).

## 10) Roteiro de Demonstracao (3-4 min) — ajuste o tempo

1. Cadastro/login.
2. Mostrar diferenca de menu entre cliente e admin (cliente **nao** ve Relatorios).
3. Como cliente: criar pedido (resumo + confirmacao).
4. Como admin: alterar status do pedido; opcional: CRUD rapido de produto.
5. **Relatorios**: abrir a **ultima** aba; alternar Hoje / Semana / Mes; mostrar pizza por status e grafico de receita; se der tempo, intervalo personalizado + Atualizar.
6. Encerrar com logout e tentar acessar rota protegida (ou mencionar `proxy.ts`).

Dica de fala para o passo 5:
- "Aqui o gestor fecha o ciclo: ve numeros do periodo, distribuicao de status e o que mais vendeu em valor, sem planilha."

## 11) Limitacoes Atuais e Proximos Passos

- Mover URL/chaves Supabase para variaveis de ambiente.
- Endurecer politicas RLS no banco (evitar permissoes excessivas para `anon`).
- Adicionar testes automatizados (unitarios e integrados).
- Criar auditoria/log de acoes administrativas.

## 12) Encerramento (20-30s)

"Concluindo, o projeto entrega uma solucao funcional para operacao da loja, com autenticacao propria por sessao, RBAC, fluxo completo de pedidos e **painel de relatorios para decisao do admin**.
Os proximos passos focam em seguranca avancada, testes e escalabilidade."

## Perguntas Provaveis (com resposta curta)

**O que e sessao stateful neste projeto?**
- E quando o servidor guarda as sessoes no banco e valida cada requisicao consultando esse registro.
- Na pratica, usamos cookie + tabela `auth_sessions` para confirmar se a sessao ainda e valida.

**Como protege senha?**
- PBKDF2 com salt aleatorio e 120 mil iteracoes; senha nunca e salva em texto puro.

**Como controla permissoes?**
- Pelo campo `role` e validacao nos endpoints.

**Cliente consegue ver relatorios?**
- Nao: o item some do menu e a API `GET /api/relatorios` responde 403; se a aba ficasse presa no estado, o front redireciona para outra aba.

**Se o cookie for roubado?**
- Cookie e HTTP-only e com expiracao; alem disso a sessao pode ser invalidada no banco.

