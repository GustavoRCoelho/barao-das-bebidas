"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListaPedidosPaginadaResposta, PedidosResumo } from "@/lib/pedidos-listagem";
import type { Pedido, PedidoStatus } from "@/lib/pedidos";
import { toast } from "sonner";

const RESUMO_VAZIO: PedidosResumo = {
  totalPedidos: 0,
  totalEmAberto: 0,
  totalEntregues: 0,
  totalFaturado: 0,
};

type Options = {
  onError: (message: string) => void;
  isAdmin: boolean;
  activeTab: string;
};

export function useGerenciarPedidosTab({ onError, isAdmin, activeTab }: Options) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [resumo, setResumo] = useState<PedidosResumo>(RESUMO_VAZIO);
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const pageRef = useRef(1);

  useEffect(() => {
    const id = window.setTimeout(() => setSearchDebounced(searchInput), 380);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const loadPage = useCallback(
    async (
      targetPage: number,
      opts?: { silent?: boolean; qOverride?: string }
    ) => {
      if (!isAdmin) return;

      const q = opts?.qOverride !== undefined ? opts.qOverride : searchDebounced;

      if (!opts?.silent) setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          pageSize: String(pageSize),
        });
        if (q.trim()) params.set("q", q.trim());

        const response = await fetch(`/api/pedidos?${params}`, { cache: "no-store" });
        const data = (await response.json()) as ListaPedidosPaginadaResposta | { erro: string };
        if (!response.ok) {
          throw new Error("erro" in data ? data.erro : "Falha ao listar pedidos.");
        }
        const body = data as ListaPedidosPaginadaResposta;
        setPedidos(body.pedidos);
        setTotal(body.total);
        setPage(body.page);
        pageRef.current = body.page;
        setResumo(body.resumo);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nao foi possivel carregar pedidos.";
        onError(message);
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [isAdmin, onError, pageSize, searchDebounced]
  );

  useEffect(() => {
    if (!isAdmin || activeTab !== "gerenciar") return;
    setPage(1);
    pageRef.current = 1;
    void loadPage(1);
  }, [isAdmin, activeTab, searchDebounced, pageSize, loadPage]);

  const fetchPedidos = useCallback(async () => {
    setSearchInput("");
    setSearchDebounced("");
    setPage(1);
    pageRef.current = 1;
    await loadPage(1, { qOverride: "" });
  }, [loadPage]);

  const goToPage = useCallback(
    (p: number) => {
      const next = Math.max(1, p);
      void loadPage(next);
    },
    [loadPage]
  );

  async function atualizarStatus(id: string, status: PedidoStatus) {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as Pedido | { erro: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao atualizar status.");
      }
      setPedidos((current) =>
        current.map((pedido) => (pedido.id === id ? (data as Pedido) : pedido))
      );
      toast.success(`Status atualizado para ${statusLabel(status)}.`);
      void loadPage(pageRef.current, { silent: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel atualizar status.";
      toast.error(message);
      onError(message);
    }
  }

  async function excluirPedido(id: string) {
    try {
      const response = await fetch(`/api/pedidos/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { erro?: string };
        throw new Error(data.erro ?? "Falha ao excluir pedido.");
      }
      const lenAntes = pedidos.length;
      const p = pageRef.current;
      setPedidos((c) => c.filter((pedido) => pedido.id !== id));
      if (lenAntes <= 1 && p > 1) {
        void loadPage(p - 1, { silent: true });
      } else {
        void loadPage(p, { silent: true });
      }
      toast.success("Pedido excluido com sucesso.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel excluir pedido.";
      toast.error(message);
      onError(message);
    }
  }

  function statusLabel(status: PedidoStatus) {
    if (status === "pendente") return "Pendente";
    if (status === "separacao") return "Em separacao";
    if (status === "enviado") return "Enviado";
    return "Entregue";
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  return {
    pedidos,
    loading,
    fetchPedidos,
    atualizarStatus,
    excluirPedido,
    totalEmAberto: resumo.totalEmAberto,
    totalFaturado: resumo.totalFaturado,
    totalEntregues: resumo.totalEntregues,
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
