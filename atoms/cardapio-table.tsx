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
import { BotaoFavoritoProduto } from "@/atoms/botao-favorito-produto";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type CardapioTableProps = {
  produtos: Produto[];
  categorias: Categoria[];
  favoritosHabilitado?: boolean;
  favoritosIds?: Set<string>;
  favoritosCarregando?: boolean;
  onToggleFavoritoProduto?: (produtoId: string) => void;
};

export function CardapioTable({
  produtos,
  categorias,
  favoritosHabilitado = false,
  favoritosIds,
  favoritosCarregando = false,
  onToggleFavoritoProduto,
}: CardapioTableProps) {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFiltroValor>(null);
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);

  const mostrarSemCategoria = useMemo(
    () => produtos.some((p) => p.categoria_id === null),
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((produto) => {
      const passaCat = produtoPassaFiltroCategoria(produto.categoria_id, filtroCategoria);
      const passaNome = !termo || produto.nome.toLowerCase().includes(termo);
      const passaFav =
        !somenteFavoritos || (favoritosIds ? favoritosIds.has(produto.id) : false);
      return passaCat && passaNome && passaFav;
    });
  }, [busca, filtroCategoria, produtos, somenteFavoritos, favoritosIds]);

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
        {favoritosHabilitado ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Favoritos
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar favoritos">
              <button
                type="button"
                onClick={() => setSomenteFavoritos(false)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  !somenteFavoritos
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/80"
                )}
              >
                Todos os produtos
              </button>
              <button
                type="button"
                onClick={() => setSomenteFavoritos(true)}
                disabled={favoritosCarregando}
                aria-pressed={somenteFavoritos}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  somenteFavoritos
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/80"
                )}
              >
                Só favoritos
              </button>
            </div>
          </div>
        ) : null}
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
                <article
                  key={produto.id}
                  data-testid="e2e-cardapio-produto-card"
                  className="app-soft-panel overflow-hidden"
                >
                  <div className="bg-muted/40 relative flex h-40 items-center justify-center border-b">
                    {favoritosHabilitado && onToggleFavoritoProduto ? (
                      <div className="absolute top-2 right-2 z-10">
                        <BotaoFavoritoProduto
                          ativo={Boolean(favoritosIds?.has(produto.id))}
                          disabled={favoritosCarregando}
                          onToggle={() => onToggleFavoritoProduto(produto.id)}
                        />
                      </div>
                    ) : null}
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
