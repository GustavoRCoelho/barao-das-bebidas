"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Produto } from "@/lib/produtos";

type Props = {
  produtos: Produto[];
  onProdutoAtualizado: (produto: Produto) => void;
  onProdutoExcluido: (produtoId: string) => void;
};

export function GerenciarCardapio({
  produtos,
  onProdutoAtualizado,
  onProdutoExcluido,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("0");
  const [estoque, setEstoque] = useState("0");
  const [foto, setFoto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoPreco, setNovoPreco] = useState("0");
  const [novoEstoque, setNovoEstoque] = useState("0");
  const [novaFoto, setNovaFoto] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroQuantidade, setFiltroQuantidade] = useState("");

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

  function iniciarEdicao(produto: Produto) {
    setEditingId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao ?? "");
    setPreco(String(produto.preco));
    setEstoque(String(produto.quantidade_estoque));
    setFoto(produto.foto_url ?? "");
  }

  function cancelarEdicao() {
    setEditingId(null);
    setNome("");
    setDescricao("");
    setPreco("0");
    setEstoque("0");
    setFoto("");
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
        }),
      });
      const data = (await response.json()) as Produto | { erro?: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao atualizar produto.");
      }
      onProdutoAtualizado(data as Produto);
      cancelarEdicao();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Falha inesperada ao atualizar produto.";
      window.alert(mensagem);
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
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Falha inesperada ao criar produto.";
      window.alert(mensagem);
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
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Falha inesperada ao excluir produto.";
      window.alert(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="app-panel min-w-0 max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Gerenciar cardápio (Admin)</CardTitle>
        <CardDescription>Edite nome, estoque e link da foto dos produtos.</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 max-w-full space-y-4 overflow-hidden">
        <form className="grid grid-cols-1 gap-2 md:grid-cols-4 xl:grid-cols-6" onSubmit={criarProduto}>
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
            className="app-input"
            placeholder="Link da foto (opcional)"
            value={novaFoto}
            onChange={(e) => setNovaFoto(e.target.value)}
          />
          <Button type="submit" disabled={salvando}>
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

        <div className="max-h-[65vh] w-full max-w-full overflow-auto rounded-md border border-border">
          <Table className="w-full min-w-[860px] table-fixed">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[150px]">Nome</TableHead>
                <TableHead className="w-[180px]">Descricao</TableHead>
                <TableHead className="w-[90px]">Preco</TableHead>
                <TableHead className="w-[90px]">Estoque</TableHead>
                <TableHead className="w-[190px]">Foto (link)</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((produto) => {
                const editando = editingId === produto.id;
                return (
                  <TableRow key={produto.id}>
                    <TableCell>
                      {editando ? (
                        <Input className="app-input" value={nome} onChange={(e) => setNome(e.target.value)} />
                      ) : (
                        <span className="block truncate">{produto.nome}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editando ? (
                        <Input
                          className="app-input"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                        />
                      ) : (
                        <span className="block truncate text-xs text-muted-foreground">
                          {produto.descricao || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editando ? (
                        <Input
                          className="app-input"
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
                    <TableCell>
                      {editando ? (
                        <Input
                          className="app-input"
                          type="number"
                          min={0}
                          value={estoque}
                          onChange={(e) => setEstoque(e.target.value)}
                        />
                      ) : (
                        produto.quantidade_estoque
                      )}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      {editando ? (
                        <Input className="app-input" value={foto} onChange={(e) => setFoto(e.target.value)} />
                      ) : (
                        <span className="block truncate text-xs text-muted-foreground">
                          {produto.foto_url || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
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
      </CardContent>
    </Card>
  );
}
