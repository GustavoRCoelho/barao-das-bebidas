# Apresentacao do Projeto - Barao das Bebidas (Temporario)

Este arquivo foi criado como apoio rapido para apresentacao ao professor.

## 1) Abertura (30-40s)

"Meu projeto se chama **Barao das Bebidas**.
Ele e um sistema web para gestao de pedidos, com dois perfis de acesso: **cliente** e **admin**.
Foi desenvolvido com **Next.js 16 (App Router)**, **TypeScript** e **Supabase**.
O objetivo principal e digitalizar o fluxo da loja: cadastro/autenticacao, criacao de pedidos, **catalogo por categorias** no banco, **favoritos por usuario** no cardapio e no pedido, controle de estoque, administracao do sistema e **visao consolidada em relatorios** para o admin."

## 2) Problema e Objetivo

- Problema: processo de pedido manual, sem visao clara de status e sem controle centralizado.
- Objetivo: criar uma plataforma unica para:
  - clientes realizarem e acompanharem pedidos;
  - admins gerenciarem pedidos, produtos, usuarios e **relatorios com graficos**;
  - manter seguranca com autenticacao e controle de acesso.

## 3) Funcionalidades Principais

### Cliente
- Cadastro e login.
- **Cardapio**: filtrar por categoria (chips) e buscar por nome; badge da categoria no card; **favoritar** produtos (coracao) e filtro **So favoritos** (lista no banco: `produto_favoritos`).
- Criacao de pedido com validacoes.
- **Modal do cardapio no pedido**: mesmos filtros por categoria + busca; ver categoria em cada item; mesmo controle de **favoritos** e filtro de favoritados.
- Selecao de itens e resumo antes da confirmacao.
- Acompanhamento de status do pedido com **busca paginada** na API (`/api/pedidos/me`) e resumo coerente com o filtro.

### Admin
- Gerenciamento de pedidos (listar com **paginação e busca** em `GET /api/pedidos`, atualizar status, excluir).
- **Produtos e estoque** (menu curto na sidebar; titulo da tela: produtos, estoque e categorias):
  - **CRUD de categorias** (nomes cadastrados no banco — sem lista fixa no codigo).
  - **CRUD de produtos** com escolha de categoria (ou sem categoria).
  - Secoes **Categorias** e **Produtos e estoque** podem ser **recolhidas**; preferencia em `localStorage` (padrao: abertas);
  - tabela de produtos com **paginacao no navegador** apos aplicar filtros (nome e quantidade).
- Gerenciamento de usuarios (alterar `role`; listagem **paginada** com filtros opcionais por nome e email em `GET /api/usuarios`).
- **Relatorios** (so admin):
  - ultima aba do menu;
  - filtros: hoje, semana, mes, periodo personalizado (card branco com datas);
  - indicadores e graficos (receita no tempo, pizza por status, barras de volume, top itens, **receita por categoria** via produto do pedido);
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
- **`categorias`** (id, nome unico)
- `produtos` (nome, preco, quantidade_estoque, foto_url, **`categoria_id`** opcional → FK em `categorias`, `ON DELETE SET NULL`)
- **`produto_favoritos`** (`usuario_id` + `produto_id`, unico o par; FKs com `ON DELETE CASCADE`)
- `pedidos` (usuario_id, produto_id, item, quantidade, valor_total, status)

Regras importantes:
- `role` com check (`admin`/`cliente`)
- validacoes de quantidade/preco/valor
- status controlado (`pendente`, `separacao`, `enviado`, `entregue`)
- categorias editaveis apenas via admin/API; cliente so consome lista para filtro

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
- Pedidos: `GET /api/pedidos` e `GET /api/pedidos/me` com `page`, `pageSize` e busca (`q` em admin; `me` tambem usa `observacao`); resposta paginada com `resumo` do conjunto filtrado; demais: `POST`, `PATCH`, `DELETE`
- Produtos: `GET /api/produtos` (com join de categoria), `POST/PATCH` com `categoria_id` opcional, `DELETE`
- **Favoritos**: `GET /api/favoritos` (`{ produto_ids }`), `POST /api/favoritos` (`{ produto_id }`), `DELETE /api/favoritos?produto_id=` (usuario logado)
- **Categorias**: `GET /api/categorias`, `POST /api/categorias`, `PATCH /api/categorias/:id`, `DELETE /api/categorias/:id` (admin nas mutacoes)
- Usuarios: `GET /api/usuarios` com `page`, `pageSize`, `nome`, `email` (opcional); `PATCH /api/usuarios/:id`
- Relatorios: `GET /api/relatorios?inicio=<ISO>&fim=<ISO>` (admin; agrega pedidos no intervalo, inclui `porCategoria`)

Frase curta para falar na hora:
- "O backend recebe duas datas em ISO, busca os pedidos no Supabase e devolve resumo, serie por dia, contagem por status, ranking de itens e agregacao por categoria — tudo no servidor para os graficos consumirem."
- Para listas grandes: "Pedidos, meus pedidos e usuarios usam paginacao na API; a tabela de produtos no admin pagina no cliente depois dos filtros."

## 9) UX e Qualidade da Experiencia

- Layout responsivo (foco mobile).
- Confirmacoes em modal (logout e envio de pedido).
- Feedback imediato com toasts (`sonner`).
- Componentizacao com `shadcn` + Tailwind.
- Graficos com `recharts`, legendas e paleta por status (CSS vars `--chart-status-*`).
- Filtros de **categoria** no cardapio e no pedido (chips + busca).
- Painel admin com blocos **recolhíveis** (localStorage).
- Tabelas de gestao com visual **alinhado** (mesmo padrao de cabecalho e area rolavel que produtos/estoque); loading dedicado nas listas de pedidos e usuarios.

## 10) Roteiro de Demonstracao (3-5 min) — ajuste o tempo

1. Cadastro/login.
2. Mostrar diferenca de menu entre cliente e admin (cliente **nao** ve Relatorios).
3. Como cliente: abrir **Cardapio** — chips de categoria, busca e **favoritos** (marcar um produto, ativar **So favoritos**); depois **Fazer pedidos** — modal com o mesmo tipo de filtro e favoritos.
4. Como admin: **Produtos e estoque** — criar ou citar categoria; associar produto a categoria; opcional: mostrar **recolher/expandir** secoes.
5. Como admin: **Gerenciar pedidos** — alterar status (rapido); opcional: mostrar busca e troca de pagina.
6. (Opcional) **Gerenciar usuarios** — filtros e paginacao.
7. **Relatorios**: **ultima** aba; Hoje / Semana / Mes; pizza, receita no tempo e **por categoria**; se der tempo, periodo personalizado.
8. Encerrar com logout e rota protegida (ou `proxy.ts`).

Dicas de fala:
- Passo 3: "As categorias vêm do banco; o cliente filtra sem precisar ver lista enorme. Favoritos ficam gravados por usuario na tabela `produto_favoritos`."
- Passo 7 (relatorios): "Aqui o gestor fecha o ciclo: numeros do periodo, status, corte por categoria e ranking de itens, sem planilha."

## 11) Limitacoes Atuais e Proximos Passos

- Mover URL/chaves Supabase para variaveis de ambiente.
- Endurecer politicas RLS no banco (evitar permissoes excessivas para `anon`).
- Adicionar testes automatizados (unitarios e integrados).
- Criar auditoria/log de acoes administrativas.

## 12) Encerramento (20-30s)

"Concluindo, o projeto entrega uma solucao funcional para operacao da loja, com autenticacao propria por sessao, RBAC, **catalogo com categorias no PostgreSQL**, fluxo completo de pedidos e **painel de relatorios** para o admin.
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

**Quem cadastra categorias?**
- So o **admin**, via API `POST/PATCH/DELETE /api/categorias`. O cliente so le a lista para filtrar cardapio e pedido.

**Como funcionam os favoritos?**
- Usuario autenticado marca produtos no cardapio ou no modal do pedido; a lista de IDs vem de `GET /api/favoritos` e as mudancas usam `POST` e `DELETE` com sessao valida no servidor.

**O que acontece se eu apagar uma categoria?**
- O registro some; produtos que usavam essa categoria ficam com `categoria_id` nulo (`ON DELETE SET NULL`).

**Se o cookie for roubado?**
- Cookie e HTTP-only e com expiracao; alem disso a sessao pode ser invalidada no banco.

