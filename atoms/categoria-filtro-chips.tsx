"use client";

import type { Categoria } from "@/lib/categorias";
import { cn } from "@/lib/utils";

export type CategoriaFiltroValor = string | null;

type CategoriaFiltroChipsProps = {
  categorias: Categoria[];
  valor: CategoriaFiltroValor;
  onChange: (valor: CategoriaFiltroValor) => void;
  mostrarSemCategoria?: boolean;
  className?: string;
};

const SEM = "__sem_categoria__";

export function CategoriaFiltroChips({
  categorias,
  valor,
  onChange,
  mostrarSemCategoria = true,
  className,
}: CategoriaFiltroChipsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        className
      )}
      role="group"
      aria-label="Filtrar por categoria"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          valor === null
            ? "border-primary bg-primary/15 text-primary"
            : "border-border bg-background text-muted-foreground hover:bg-muted/80"
        )}
      >
        Todas
      </button>
      {mostrarSemCategoria ? (
        <button
          type="button"
          onClick={() => onChange(SEM)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            valor === SEM
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-background text-muted-foreground hover:bg-muted/80"
          )}
        >
          Sem categoria
        </button>
      ) : null}
      {categorias.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            valor === cat.id
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-background text-muted-foreground hover:bg-muted/80"
          )}
        >
          {cat.nome}
        </button>
      ))}
    </div>
  );
}

export function produtoPassaFiltroCategoria(
  categoriaIdProduto: string | null,
  filtro: CategoriaFiltroValor
): boolean {
  if (filtro === null) return true;
  if (filtro === SEM) return categoriaIdProduto === null;
  return categoriaIdProduto === filtro;
}
