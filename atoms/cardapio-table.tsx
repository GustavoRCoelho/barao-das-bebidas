"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Categoria } from "@/lib/categorias";
import type { Produto } from "@/lib/produtos";
import {
  CategoriaFiltroChips,
  produtoPassaFiltroCategoria,
  type CategoriaFiltroValor,
} from "@/atoms/categoria-filtro-chips";
import { useMemo, useState } from "react";

type CardapioTableProps = {
  produtos: Produto[];
  categorias: Categoria[];
};

export function CardapioTable({ produtos, categorias }: CardapioTableProps) {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFiltroValor>(null);

  const mostrarSemCategoria = useMemo(
    () => produtos.some((p) => p.categoria_id === null),
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((produto) => {
      const passaCat = produtoPassaFiltroCategoria(produto.categoria_id, filtroCategoria);
      const passaNome = !termo || produto.nome.toLowerCase().includes(termo);
      return passaCat && passaNome;
    });
  }, [busca, filtroCategoria, produtos]);

  return (
    <Card className="app-panel">
      <CardHeader>
        <CardTitle>Cardápio</CardTitle>
        <CardDescription>
          Navegue por categoria e pesquise pelo nome. Mesma lógica do pedido rápido.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Categoria
          </p>
          <CategoriaFiltroChips
            categorias={categorias}
            valor={filtroCategoria}
            onChange={setFiltroCategoria}
            mostrarSemCategoria={mostrarSemCategoria}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Pesquisar por nome do produto..."
            className="app-input"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        {produtosFiltrados.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado para esse filtro.
          </div>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {produtosFiltrados.map((produto) => (
                <article key={produto.id} className="app-soft-panel overflow-hidden">
                  <div className="bg-muted/40 flex h-40 items-center justify-center border-b">
                    {produto.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.foto_url}
                        alt={produto.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem foto</span>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-base font-semibold">{produto.nome}</h3>
                      {produto.categoria ? (
                        <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">
                          {produto.categoria.nome}
                        </Badge>
                      ) : null}
                    </div>
                    {produto.descricao ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{produto.descricao}</p>
                    ) : null}
                    <p className="text-sm font-semibold text-primary">
                      R$ {Number(produto.preco).toFixed(2)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
