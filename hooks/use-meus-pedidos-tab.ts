"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ListaPedidosPaginadaResposta, PedidosResumo } from "@/lib/pedidos-listagem";
import type { Pedido } from "@/lib/pedidos";

const RESUMO_VAZIO: PedidosResumo = {
  totalPedidos: 0,
  totalEmAberto: 0,
  totalEntregues: 0,
  totalFaturado: 0,
};

type Options = {
  enabled: boolean;
  onError: (message: string) => void;
};

export function useMeusPedidosTab({ enabled, onError }: Options) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [resumo, setResumo] = useState<PedidosResumo>(RESUMO_VAZIO);
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setSearchDebounced(searchInput), 380);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const loadPage = useCallback(
    async (targetPage: number, opts?: { silent?: boolean; qOverride?: string }) => {
      if (!enabled) return;

      const q = opts?.qOverride !== undefined ? opts.qOverride : searchDebounced;

      if (!opts?.silent) setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          pageSize: String(pageSize),
        });
        if (q.trim()) params.set("q", q.trim());

        const response = await fetch(`/api/pedidos/me?${params}`, { cache: "no-store" });
        const data = (await response.json()) as ListaPedidosPaginadaResposta | { erro: string };

        if (!response.ok) {
          throw new Error("erro" in data ? data.erro : "Falha ao listar meus pedidos.");
        }

        const body = data as ListaPedidosPaginadaResposta;
        setPedidos(body.pedidos);
        setTotal(body.total);
        setPage(body.page);
        setResumo(body.resumo);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nao foi possivel carregar meus pedidos.";
        onError(message);
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [enabled, onError, pageSize, searchDebounced]
  );

  useEffect(() => {
    if (!enabled) return;
    setPage(1);
    void loadPage(1);
  }, [enabled, searchDebounced, pageSize, loadPage]);

  const fetchMeusPedidos = useCallback(async () => {
    setSearchInput("");
    setSearchDebounced("");
    setPage(1);
    await loadPage(1, { qOverride: "" });
  }, [loadPage]);

  const goToPage = useCallback(
    (p: number) => {
      const next = Math.max(1, p);
      void loadPage(next);
    },
    [loadPage]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  return {
    pedidos,
    loading,
    fetchMeusPedidos,
    resumo,
    page,
    pageSize,
    total,
    totalPages,
    goToPage,
    setPageSize,
    searchInput,
    setSearchInput,
  };
}
