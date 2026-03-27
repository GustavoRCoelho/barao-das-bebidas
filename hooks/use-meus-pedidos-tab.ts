"use client";

import { useCallback, useEffect, useState } from "react";
import type { Pedido } from "@/lib/pedidos";

type Options = {
  enabled: boolean;
  onError: (message: string) => void;
};

export function useMeusPedidosTab({ enabled, onError }: Options) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeusPedidos = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const response = await fetch("/api/pedidos/me", { cache: "no-store" });
      const data = (await response.json()) as Pedido[] | { erro: string };

      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao listar meus pedidos.");
      }

      setPedidos(data as Pedido[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar meus pedidos.";
      onError(message);
    } finally {
      setLoading(false);
    }
  }, [enabled, onError]);

  useEffect(() => {
    if (enabled) {
      fetchMeusPedidos();
    }
  }, [enabled, fetchMeusPedidos]);

  return {
    pedidos,
    loading,
    fetchMeusPedidos,
  };
}

