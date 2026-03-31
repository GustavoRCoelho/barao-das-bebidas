"use client";

import { Home } from "lucide-react";

type DashboardHeaderProps = {
  abaAtiva:
    | "cardapio"
    | "criar"
    | "acompanhar"
    | "gerenciar-cardapio"
    | "gerenciar"
    | "relatorios"
    | "gerenciar-usuarios";
  totalFaturado: string;
  totalPedidos: number;
  showStats: boolean;
};

export function DashboardHeader({
  abaAtiva,
  totalFaturado,
  totalPedidos,
  showStats,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <h1
          className="app-heading-ornate mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          data-ornament-left="f"
          data-ornament-right="g"
        >
          {abaAtiva === "cardapio"
            ? "Cardápio de Produtos"
            : abaAtiva === "gerenciar-cardapio"
              ? "Produtos, estoque e categorias"
            : abaAtiva === "criar"
              ? "Novo Pedido"
              : abaAtiva === "acompanhar"
                ? "Acompanhar Pedidos"
              : abaAtiva === "gerenciar-usuarios"
                ? "Administração de Usuários"
              : abaAtiva === "relatorios"
                ? "Relatórios e indicadores"
              : "Gestão de Pedidos"}
        </h1>
      </div>

      {showStats ? (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <div className="app-soft-panel p-3 px-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Mês</p>
            <p className="text-lg font-semibold text-foreground">{totalFaturado}</p>
          </div>
          <div className="app-soft-panel p-3 px-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Pedidos</p>
            <p className="text-lg font-semibold text-foreground">{totalPedidos}</p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
