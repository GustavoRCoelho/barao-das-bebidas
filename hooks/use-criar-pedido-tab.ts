"use client";

import { useState } from "react";
import type { Pedido, PedidoItemSelecionado } from "@/lib/pedidos";
import type { PedidoFormState } from "@/atoms/pedido-form";
import { toast } from "sonner";

const initialFormState: PedidoFormState = {
  cliente: "",
  telefone: "",
  endereco: "",
  item: "",
  produto_id: "",
  quantidade: "1",
  valor_total: "",
  observacao: "",
};

type Options = {
  onError: (message: string) => void;
  onSuccess?: (pedido: Pedido) => Promise<void> | void;
};

export function useCriarPedidoTab({ onError, onSuccess }: Options) {
  const [form, setForm] = useState<PedidoFormState>(initialFormState);
  const [salvando, setSalvando] = useState(false);

  async function submitPedido(
    event: React.FormEvent<HTMLFormElement>,
    itensSelecionados: PedidoItemSelecionado[]
  ) {
    event.preventDefault();
    const cliente = form.cliente.trim();
    const telefone = form.telefone.trim();
    const endereco = form.endereco.trim();
    if (!cliente || !telefone || !endereco) {
      const mensagem = "Preencha cliente, telefone e endereco para finalizar o pedido.";
      toast.error(mensagem);
      onError(mensagem);
      return;
    }
    if (itensSelecionados.length === 0) {
      const mensagem = "Selecione ao menos um item no cardapio.";
      toast.error(mensagem);
      onError(mensagem);
      return;
    }
    setSalvando(true);

    try {
      const quantidadeTotal = itensSelecionados.reduce((acc, item) => acc + item.quantidade, 0);
      const itensDescricao = itensSelecionados
        .map((item) => `${item.nome} x${item.quantidade}`)
        .join(", ");

      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente,
          telefone,
          endereco,
          item: itensDescricao,
          produto_id: itensSelecionados[0]?.produto_id,
          itens: itensSelecionados,
          quantidade: quantidadeTotal || Number(form.quantidade),
          valor_total: Number(form.valor_total),
          observacao: form.observacao,
          status: "pendente",
        }),
      });
      const data = (await response.json()) as Pedido | { erro: string };

      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao cadastrar pedido.");
      }

      setForm(initialFormState);
      toast.success("Pedido criado com sucesso.");
      if (onSuccess) {
        await onSuccess(data as Pedido);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel cadastrar pedido.";
      toast.error(message);
      onError(message);
    } finally {
      setSalvando(false);
    }
  }

  return {
    form,
    salvando,
    setForm,
    submitPedido,
  };
}
