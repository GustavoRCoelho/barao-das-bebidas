import type { Pedido } from "./pedidos";

export type PedidosResumo = {
  totalPedidos: number;
  totalEmAberto: number;
  totalEntregues: number;
  totalFaturado: number;
};

export type ListaPedidosPaginadaResposta = {
  pedidos: Pedido[];
  total: number;
  page: number;
  pageSize: number;
  resumo: PedidosResumo;
};

export function agregarResumoPedidos(
  rows: { valor_total: number | string; status: string }[] | null
): PedidosResumo {
  const list = rows ?? [];
  let totalFaturado = 0;
  let totalEntregues = 0;
  for (const r of list) {
    totalFaturado += Number(r.valor_total);
    if (r.status === "entregue") totalEntregues += 1;
  }
  const totalPedidos = list.length;
  return {
    totalPedidos,
    totalEmAberto: totalPedidos - totalEntregues,
    totalEntregues,
    totalFaturado: Math.round(totalFaturado * 100) / 100,
  };
}

export function parsePaginacaoPedidos(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const rawSize = parseInt(url.searchParams.get("pageSize") ?? "10", 10) || 10;
  const pageSize = Math.min(50, Math.max(5, rawSize));
  const q = url.searchParams.get("q")?.trim().slice(0, 120) ?? "";
  return { page, pageSize, q };
}

/** Evita que caracteres especiais quebrem o filtro `.or()` do PostgREST. */
export function padraoBuscaPedidos(termo: string): string | null {
  const t = termo.trim().replace(/,/g, " ").replace(/%/g, "").slice(0, 120);
  if (!t) return null;
  return `%${t}%`;
}
