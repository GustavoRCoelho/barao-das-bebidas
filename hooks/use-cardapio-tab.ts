"use client";

import { useCallback, useState } from "react";
import type { Produto } from "@/lib/produtos";

type Options = {
  onError: (message: string) => void;
};

export function useCardapioTab({ onError }: Options) {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await fetch("/api/produtos", { cache: "no-store" });
      const data = (await response.json()) as Produto[] | { erro: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao listar produtos.");
      }
      setProdutos(data as Produto[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar produtos.";
      onError(message);
    }
  }, [onError]);

  const adicionarProduto = useCallback((produto: Produto) => {
    setProdutos((atual) => [produto, ...atual]);
  }, []);

  const atualizarProduto = useCallback((produtoAtualizado: Produto) => {
    setProdutos((atual) => {
      const existe = atual.some((produto) => produto.id === produtoAtualizado.id);
      if (existe) {
        return atual.map((produto) =>
          produto.id === produtoAtualizado.id ? produtoAtualizado : produto
        );
      }
      return [produtoAtualizado, ...atual];
    });
  }, []);

  const removerProduto = useCallback((produtoId: string) => {
    setProdutos((atual) => atual.filter((produto) => produto.id !== produtoId));
  }, []);

  return {
    produtos,
    fetchProdutos,
    adicionarProduto,
    atualizarProduto,
    removerProduto,
  };
}
