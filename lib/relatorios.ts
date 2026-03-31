import type { PedidoStatus } from "@/lib/pedidos";

export type RelatorioResumo = {
  totalPedidos: number;
  receitaTotal: number;
  ticketMedio: number;
  pedidosEntregues: number;
  unidadesVendidas: number;
};

export type RelatorioPorStatus = {
  status: PedidoStatus;
  label: string;
  quantidade: number;
};

export type RelatorioSeriePonto = {
  data: string;
  receita: number;
  pedidos: number;
};

export type RelatorioTopItem = {
  item: string;
  quantidade: number;
  receita: number;
};

export type RelatorioResposta = {
  periodo: { inicio: string; fim: string };
  resumo: RelatorioResumo;
  porStatus: RelatorioPorStatus[];
  serieTemporal: RelatorioSeriePonto[];
  topItens: RelatorioTopItem[];
};
