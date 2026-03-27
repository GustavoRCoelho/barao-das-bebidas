"use client";

import { Home } from "lucide-react";

type DashboardHeaderProps = {
  abaAtiva:
    | "cardapio"
    | "criar"
    | "acompanhar"
    | "gerenciar-cardapio"
    | "gerenciar"
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
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="text-primary flex items-center gap-2 text-xs font-medium">
          <Home className="size-3" />
          <span className="tracking-wider uppercase">Painel Operacional</span>
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {abaAtiva === "cardapio"
            ? "Cardápio de Produtos"
            : abaAtiva === "gerenciar-cardapio"
              ? "Administração do Cardápio"
            : abaAtiva === "criar"
              ? "Novo Pedido"
              : abaAtiva === "acompanhar"
                ? "Acompanhar Pedidos"
              : abaAtiva === "gerenciar-usuarios"
                ? "Administração de Usuários"
              : "Gestão de Pedidos"}
        </h1>
      </div>

      {showStats ? (
        <div className="flex gap-3">
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
