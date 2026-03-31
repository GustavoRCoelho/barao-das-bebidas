"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Categoria } from "@/lib/categorias";
import type { Produto } from "@/lib/produtos";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const SEM_CATEGORIA = "__none__";

const LS_CATEGORIAS_MIN = "barao-das-bebidas:admin:categorias-card-minimizado";
const LS_PRODUTOS_MIN = "barao-das-bebidas:admin:estoques-card-minimizado";

function lerMinimizado(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function gravarMinimizado(key: string, minimizado: boolean) {
  try {
    localStorage.setItem(key, minimizado ? "1" : "0");
  } catch {
    /* ignore */
  }
}

type Props = {
  produtos: Produto[];
  categorias: Categoria[];
  onProdutoAtualizado: (produto: Produto) => void;
  onProdutoExcluido: (produtoId: string) => void;
  onCardapioRefresh: () => void | Promise<void>;
};

export function GerenciarProdutosEstoque({
  produtos,
  categorias,
  onProdutoAtualizado,
  onProdutoExcluido,
  onCardapioRefresh,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("0");
  const [estoque, setEstoque] = useState("0");
  const [foto, setFoto] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>(SEM_CATEGORIA);
  const [salvando, setSalvando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoPreco, setNovoPreco] = useState("0");
  const [novoEstoque, setNovoEstoque] = useState("0");
  const [novaFoto, setNovaFoto] = useState("");
  const [novaCategoriaId, setNovaCategoriaId] = useState<string>(SEM_CATEGORIA);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroQuantidade, setFiltroQuantidade] = useState("");
  const [produtoPage, setProdutoPage] = useState(1);
  const [produtoPageSize, setProdutoPageSize] = useState(10);

  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catNome, setCatNome] = useState("");
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");

  const [categoriasMinimizado, setCategoriasMinimizado] = useState(false);
  const [produtosMinimizado, setProdutosMinimizado] = useState(false);

  useLayoutEffect(() => {
    setCategoriasMinimizado(lerMinimizado(LS_CATEGORIAS_MIN));
    setProdutosMinimizado(lerMinimizado(LS_PRODUTOS_MIN));
  }, []);

  const produtosFiltrados = useMemo(() => {
    const termo = filtroNome.trim().toLowerCase();
    const qtd = filtroQuantidade.trim();
    const qtdNumero = qtd ? Number(qtd) : null;

    return produtos.filter((produto) => {
      const passouNome = !termo || produto.nome.toLowerCase().includes(termo);
      const passouQuantidade =
        qtdNumero === null || Number.isNaN(qtdNumero)
          ? true
          : produto.quantidade_estoque === qtdNumero;
      return passouNome && passouQuantidade;
    });
  }, [produtos, filtroNome, filtroQuantidade]);

  const totalProdutosLista = produtosFiltrados.length;
  const totalProdutoPages = Math.max(1, Math.ceil(totalProdutosLista / produtoPageSize));

  const produtosPagina = useMemo(() => {
    const start = (produtoPage - 1) * produtoPageSize;
    return produtosFiltrados.slice(start, start + produtoPageSize);
  }, [produtosFiltrados, produtoPage, produtoPageSize]);

  useEffect(() => {
    setProdutoPage(1);
  }, [filtroNome, filtroQuantidade]);

  useEffect(() => {
    if (produtoPage > totalProdutoPages) {
      setProdutoPage(totalProdutoPages);
    }
  }, [produtoPage, totalProdutoPages]);

  const produtoInicio = totalProdutosLista === 0 ? 0 : (produtoPage - 1) * produtoPageSize + 1;
  const produtoFim = Math.min(produtoPage * produtoPageSize, totalProdutosLista);

  function selecionarValorCategoria(value: string) {
    return value === SEM_CATEGORIA ? null : value;
  }

  function iniciarEdicao(produto: Produto) {
    setEditingId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao ?? "");
    setPreco(String(produto.preco));
    setEstoque(String(produto.quantidade_estoque));
    setFoto(produto.foto_url ?? "");
    setCategoriaId(produto.categoria_id ?? SEM_CATEGORIA);
  }

  function cancelarEdicao() {
    setEditingId(null);
    setNome("");
    setDescricao("");
    setPreco("0");
    setEstoque("0");
    setFoto("");
    setCategoriaId(SEM_CATEGORIA);
  }

  async function salvarEdicao(id: string) {
    setSalvando(true);
    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          descricao,
          preco: Number(preco),
          quantidade_estoque: Number(estoque),
          foto_url: foto,
          categoria_id: selecionarValorCategoria(categoriaId),
        }),
      });
      const data = (await response.json()) as Produto | { erro?: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao atualizar produto.");
      }
      onProdutoAtualizado(data as Produto);
      cancelarEdicao();
      toast.success("Produto atualizado com sucesso.");
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Falha inesperada ao atualizar produto.";
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  async function criarProduto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoNome,
          descricao: novaDescricao,
          preco: Number(novoPreco),
          quantidade_estoque: Number(novoEstoque),
          foto_url: novaFoto,
          categoria_id: selecionarValorCategoria(novaCategoriaId),
        }),
      });
      const data = (await response.json()) as Produto | { erro?: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao criar produto.");
      }
      onProdutoAtualizado(data as Produto);
      setNovoNome("");
      setNovaDescricao("");
      setNovoPreco("0");
      setNovoEstoque("0");
      setNovaFoto("");
      setNovaCategoriaId(SEM_CATEGORIA);
      toast.success("Produto criado com sucesso.");
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Falha inesperada ao criar produto.";
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(id: string) {
    const confirmar = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmar) return;

    setSalvando(true);
    try {
      const response = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { erro?: string };
        throw new Error(data.erro ?? "Falha ao excluir produto.");
      }
      onProdutoExcluido(id);
      if (editingId === id) {
        cancelarEdicao();
      }
      toast.success("Produto excluido com sucesso.");
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Falha inesperada ao excluir produto.";
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicaoCategoria(cat: Categoria) {
    setCatEditingId(cat.id);
    setCatNome(cat.nome);
  }

  function cancelarEdicaoCategoria() {
    setCatEditingId(null);
    setCatNome("");
  }

  async function criarCategoria(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nomeTrim = novaCategoriaNome.trim();
    if (!nomeTrim) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    setSalvando(true);
    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeTrim }),
      });
      const data = (await response.json()) as Categoria | { erro?: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao criar categoria.");
      }
      setNovaCategoriaNome("");
      toast.success("Categoria criada.");
      await onCardapioRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar categoria.");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarCategoria(id: string) {
    setSalvando(true);
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: catNome.trim() }),
      });
      const data = (await response.json()) as Categoria | { erro?: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao atualizar categoria.");
      }
      cancelarEdicaoCategoria();
      toast.success("Categoria atualizada.");
      await onCardapioRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar categoria.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCategoria(id: string) {
    const confirmar = window.confirm(
      "Excluir esta categoria? Os produtos vinculados ficarão sem categoria."
    );
    if (!confirmar) return;
    setSalvando(true);
    try {
      const response = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { erro?: string };
        throw new Error(data.erro ?? "Falha ao excluir categoria.");
      }
      if (catEditingId === id) cancelarEdicaoCategoria();
      toast.success("Categoria excluida.");
      await onCardapioRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir categoria.");
    } finally {
      setSalvando(false);
    }
  }

  function SelectCategoria({
    value,
    onChange,
    id,
  }: {
    value: string;
    onChange: (v: string) => void;
    id?: string;
  }) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="app-input w-full min-w-[140px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEM_CATEGORIA}>Sem categoria</SelectItem>
          {categorias.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="app-panel min-w-0 max-w-full overflow-hidden">
        <Collapsible
          open={!categoriasMinimizado}
          onOpenChange={(aberto) => {
            const minimizado = !aberto;
            setCategoriasMinimizado(minimizado);
            gravarMinimizado(LS_CATEGORIAS_MIN, minimizado);
          }}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <CardTitle>Categorias</CardTitle>
              <CardDescription>
                Cadastre e edite categorias aqui. Elas aparecem nos filtros do cardápio e na hora de classificar
                produtos.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={
                  categoriasMinimizado ? "Expandir seção Categorias" : "Minimizar seção Categorias"
                }
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    !categoriasMinimizado && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={criarCategoria}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="nova-cat" className="text-xs font-medium text-muted-foreground">
                Nova categoria
              </label>
              <Input
                id="nova-cat"
                className="app-input"
                placeholder="Ex.: Cervejas"
                value={novaCategoriaNome}
                onChange={(e) => setNovaCategoriaNome(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={salvando}>
              Adicionar
            </Button>
          </form>

          <div className="max-h-[280px] overflow-auto rounded-xl border border-border/80 shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50 dark:bg-muted/25">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="uppercase tracking-wider text-[11px]">Nome</TableHead>
                  <TableHead className="w-[200px] text-right uppercase tracking-wider text-[11px]">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                      Nenhuma categoria ainda. Crie a primeira acima.
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((cat) => {
                    const editando = catEditingId === cat.id;
                    return (
                      <TableRow key={cat.id} className="align-top">
                        <TableCell className="py-4">
                          {editando ? (
                            <Input
                              className="app-input h-10"
                              value={catNome}
                              onChange={(e) => setCatNome(e.target.value)}
                            />
                          ) : (
                            <span className="text-[15px] font-semibold leading-snug text-foreground">
                              {cat.nome}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          {editando ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => salvarCategoria(cat.id)} disabled={salvando}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelarEdicaoCategoria}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => iniciarEdicaoCategoria(cat)}>
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => excluirCategoria(cat.id)}
                                disabled={salvando}
                              >
                                Excluir
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="app-panel min-w-0 max-w-full overflow-hidden">
        <Collapsible
          open={!produtosMinimizado}
          onOpenChange={(aberto) => {
            const minimizado = !aberto;
            setProdutosMinimizado(minimizado);
            gravarMinimizado(LS_PRODUTOS_MIN, minimizado);
          }}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <CardTitle>Produtos e estoque</CardTitle>
              <CardDescription>
                Preço, estoque, foto e categoria. Produtos sem estoque não podem ser pedidos além do disponível.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={
                  produtosMinimizado ? "Expandir seção Produtos e estoque" : "Minimizar seção Produtos e estoque"
                }
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    !produtosMinimizado && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="min-w-0 max-w-full space-y-4 overflow-hidden pt-0">
          <form
            className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-7"
            onSubmit={criarProduto}
          >
            <Input
              className="app-input"
              placeholder="Nome do produto"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
            />
            <Input
              className="app-input"
              placeholder="Descricao (opcional)"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
            />
            <SelectCategoria value={novaCategoriaId} onChange={setNovaCategoriaId} id="novo-prod-cat" />
            <Input
              className="app-input"
              type="number"
              min={0}
              step="0.01"
              placeholder="Preco"
              value={novoPreco}
              onChange={(e) => setNovoPreco(e.target.value)}
              required
            />
            <Input
              className="app-input"
              type="number"
              min={0}
              placeholder="Estoque"
              value={novoEstoque}
              onChange={(e) => setNovoEstoque(e.target.value)}
              required
            />
            <Input
              className="app-input xl:col-span-1"
              placeholder="Link da foto (opcional)"
              value={novaFoto}
              onChange={(e) => setNovaFoto(e.target.value)}
            />
            <Button type="submit" className="xl:col-span-1" disabled={salvando}>
              {salvando ? "Salvando..." : "Adicionar produto"}
            </Button>
          </form>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
              className="app-input"
              placeholder="Filtrar por nome"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
            <Input
              className="app-input"
              type="number"
              min={0}
              placeholder="Filtrar por quantidade exata"
              value={filtroQuantidade}
              onChange={(e) => setFiltroQuantidade(e.target.value)}
            />
          </div>

          <div className="max-h-[70vh] w-full max-w-full overflow-auto rounded-xl border border-border/80 shadow-sm">
            <Table className="w-full min-w-[1040px] table-fixed">
              <TableHeader className="bg-muted/50 dark:bg-muted/25">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px] uppercase tracking-wider text-[11px]">Nome</TableHead>
                  <TableHead className="w-[180px] uppercase tracking-wider text-[11px]">
                    Descrição
                  </TableHead>
                  <TableHead className="w-[130px] uppercase tracking-wider text-[11px]">
                    Categoria
                  </TableHead>
                  <TableHead className="w-[92px] uppercase tracking-wider text-[11px]">Preço</TableHead>
                  <TableHead className="w-[88px] uppercase tracking-wider text-[11px]">Estoque</TableHead>
                  <TableHead className="w-[200px] uppercase tracking-wider text-[11px]">
                    Foto (link)
                  </TableHead>
                  <TableHead className="w-[148px] text-right uppercase tracking-wider text-[11px]">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalProdutosLista === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Nenhum produto para exibir com esse filtro.
                    </TableCell>
                  </TableRow>
                ) : null}
                {produtosPagina.map((produto) => {
                  const editando = editingId === produto.id;
                  return (
                    <TableRow key={produto.id} className="align-top">
                      <TableCell className="py-4">
                        {editando ? (
                          <Input
                            className="app-input h-10"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                          />
                        ) : (
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {produto.nome}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 whitespace-normal">
                        {editando ? (
                          <Input
                            className="app-input h-10"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                          />
                        ) : (
                          <span className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {produto.descricao?.trim() ? produto.descricao : "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {editando ? (
                          <SelectCategoria value={categoriaId} onChange={setCategoriaId} />
                        ) : (
                          <span className="text-sm leading-snug text-muted-foreground">
                            {produto.categoria?.nome ?? "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium tabular-nums text-foreground">
                        {editando ? (
                          <Input
                            className="app-input h-10"
                            type="number"
                            min={0}
                            step="0.01"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                          />
                        ) : (
                          `R$ ${Number(produto.preco).toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium tabular-nums">
                        {editando ? (
                          <Input
                            className="app-input h-10"
                            type="number"
                            min={0}
                            value={estoque}
                            onChange={(e) => setEstoque(e.target.value)}
                          />
                        ) : (
                          produto.quantidade_estoque
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] py-4 whitespace-normal">
                        {editando ? (
                          <Input
                            className="app-input h-10"
                            value={foto}
                            onChange={(e) => setFoto(e.target.value)}
                          />
                        ) : (
                          <span className="block break-all text-xs leading-relaxed text-muted-foreground">
                            {produto.foto_url || "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-right align-middle">
                        {editando ? (
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <Button size="sm" onClick={() => salvarEdicao(produto.id)} disabled={salvando}>
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelarEdicao}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <Button size="sm" variant="outline" onClick={() => iniciarEdicao(produto)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => excluirProduto(produto.id)}
                              disabled={salvando}
                            >
                              Excluir
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs tabular-nums">
              {totalProdutosLista === 0 ? (
                "Nenhum produto para exibir com esse filtro."
              ) : (
                <>
                  Mostrando <span className="font-medium text-foreground">{produtoInicio}</span>–
                  <span className="font-medium text-foreground">{produtoFim}</span> de{" "}
                  <span className="font-medium text-foreground">{totalProdutosLista}</span> produtos
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(produtoPageSize)}
                onValueChange={(v) => {
                  setProdutoPageSize(Number(v));
                  setProdutoPage(1);
                }}
              >
                <SelectTrigger className="app-input h-8 w-[118px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / página</SelectItem>
                  <SelectItem value="20">20 / página</SelectItem>
                  <SelectItem value="50">50 / página</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={produtoPage <= 1}
                  onClick={() => setProdutoPage((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-muted-foreground min-w-28 px-1 text-center text-xs tabular-nums">
                  Página {produtoPage} / {totalProdutoPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={produtoPage >= totalProdutoPages}
                  onClick={() => setProdutoPage((p) => Math.min(totalProdutoPages, p + 1))}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
