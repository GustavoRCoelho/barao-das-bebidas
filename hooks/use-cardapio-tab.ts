"use client";

import { useCallback, useState } from "react";
import type { Categoria } from "@/lib/categorias";
import type { Produto } from "@/lib/produtos";

type Options = {
  onError: (message: string) => void;
};

export function useCardapioTab({ onError }: Options) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const fetchProdutos = useCallback(async () => {
    try {
      const [resP, resC] = await Promise.all([
        fetch("/api/produtos", { cache: "no-store" }),
        fetch("/api/categorias", { cache: "no-store" }),
      ]);
      const dataP = (await resP.json()) as Produto[] | { erro: string };
      const dataC = (await resC.json()) as Categoria[] | { erro: string };

      if (!resP.ok) {
        throw new Error("erro" in dataP ? dataP.erro : "Falha ao listar produtos.");
      }
      if (!resC.ok) {
        throw new Error("erro" in dataC ? dataC.erro : "Falha ao listar categorias.");
      }

      setProdutos(dataP as Produto[]);
      setCategorias(dataC as Categoria[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar cardapio.";
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
    categorias,
    fetchProdutos,
    adicionarProduto,
    atualizarProduto,
    removerProduto,
  };
}
