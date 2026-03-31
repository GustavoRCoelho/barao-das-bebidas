"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

type Options = {
  enabled: boolean;
  onError: (message: string) => void;
};

export function useFavoritosProdutos({ enabled, onError }: Options) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavoritos = useCallback(async () => {
    if (!enabled) {
      setIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/favoritos", { cache: "no-store" });
      const data = (await res.json()) as { produto_ids?: string[]; erro?: string };
      if (!res.ok) {
        throw new Error(data.erro ?? "Falha ao carregar favoritos.");
      }
      setIds(new Set(data.produto_ids ?? []));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar favoritos.";
      onError(message);
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [enabled, onError]);

  const toggleFavorito = useCallback(
    async (produtoId: string) => {
      if (!enabled) return;

      let estavaFavoritado = false;
      setIds((prev) => {
        estavaFavoritado = prev.has(produtoId);
        const next = new Set(prev);
        if (estavaFavoritado) next.delete(produtoId);
        else next.add(produtoId);
        return next;
      });

      try {
        if (estavaFavoritado) {
          const res = await fetch(`/api/favoritos?produto_id=${encodeURIComponent(produtoId)}`, {
            method: "DELETE",
          });
          const data = (await res.json()) as { erro?: string };
          if (!res.ok) {
            throw new Error(data.erro ?? "Falha ao remover favorito.");
          }
        } else {
          const res = await fetch("/api/favoritos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ produto_id: produtoId }),
          });
          const data = (await res.json()) as { erro?: string };
          if (!res.ok) {
            throw new Error(data.erro ?? "Falha ao favoritar produto.");
          }
        }
      } catch (error) {
        setIds((prev) => {
          const next = new Set(prev);
          if (estavaFavoritado) next.add(produtoId);
          else next.delete(produtoId);
          return next;
        });
        const message =
          error instanceof Error ? error.message : "Nao foi possivel atualizar favorito.";
        toast.error(message);
        onError(message);
      }
    },
    [enabled, onError]
  );

  return {
    favoritosIds: ids,
    favoritosLoading: loading,
    fetchFavoritos,
    toggleFavorito,
  };
}
