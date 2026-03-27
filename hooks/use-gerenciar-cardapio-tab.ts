"use client";

import { useCallback } from "react";
import type { Produto } from "@/lib/produtos";

type Options = {
  onProdutoAtualizado: (produto: Produto) => void;
  onProdutoExcluido: (produtoId: string) => void;
};

export function useGerenciarCardapioTab({ onProdutoAtualizado, onProdutoExcluido }: Options) {
  const handleProdutoAtualizado = useCallback(
    (produto: Produto) => {
      onProdutoAtualizado(produto);
    },
    [onProdutoAtualizado]
  );

  const handleProdutoExcluido = useCallback(
    (produtoId: string) => {
      onProdutoExcluido(produtoId);
    },
    [onProdutoExcluido]
  );

  return {
    handleProdutoAtualizado,
    handleProdutoExcluido,
  };
}
