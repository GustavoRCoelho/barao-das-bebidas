"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Pedido, PedidoStatus } from "@/lib/pedidos";
import { toast } from "sonner";

type Options = {
  onError: (message: string) => void;
  isAdmin: boolean;
  activeTab: string;
};

export function useGerenciarPedidosTab({ onError, isAdmin, activeTab }: Options) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPedidos = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await fetch("/api/pedidos", { cache: "no-store" });
      const data = (await response.json()) as Pedido[] | { erro: string };
      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao listar pedidos.");
      }
      setPedidos(data as Pedido[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar pedidos.";
      onError(message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, onError]);

  useEffect(() => {
    if (isAdmin && activeTab === "gerenciar") {
      fetchPedidos();
    }
  }, [isAdmin, activeTab, fetchPedidos]);

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
      setPedidos((current) => current.filter((pedido) => pedido.id !== id));
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

  const totalEmAberto = useMemo(
    () => pedidos.filter((pedido) => pedido.status !== "entregue").length,
    [pedidos]
  );
  const totalFaturado = useMemo(
    () => pedidos.reduce((acc, pedido) => acc + Number(pedido.valor_total), 0),
    [pedidos]
  );
  const totalEntregues = useMemo(
    () => pedidos.filter((pedido) => pedido.status === "entregue").length,
    [pedidos]
  );

  return {
    pedidos,
    loading,
    fetchPedidos,
    atualizarStatus,
    excluirPedido,
    totalEmAberto,
    totalFaturado,
    totalEntregues,
  };
}
