"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock3, PackageCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Pedido, PedidoStatus } from "@/lib/pedidos";

type Props = {
  pedidos: Pedido[];
  loading: boolean;
  statusLabel: Record<PedidoStatus, string>;
  statusClassName: (status: PedidoStatus) => string;
  formatCurrency: (value: number) => string;
};

function formatDateBR(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

function formatDateTimeBR(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_ORDER: PedidoStatus[] = ["pendente", "separacao", "enviado", "entregue"];

function statusTrackColor(status: PedidoStatus) {
  if (status === "pendente") return "#facc15";
  if (status === "separacao") return "#38bdf8";
  if (status === "enviado") return "#a78bfa";
  return "#34d399";
}

export function MeusPedidos({ pedidos, loading, statusLabel, statusClassName, formatCurrency }: Props) {
  const [busca, setBusca] = useState("");

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pedidos;
    return pedidos.filter(
      (p) =>
        p.cliente.toLowerCase().includes(termo) ||
        p.item.toLowerCase().includes(termo) ||
        (p.descricao ?? "").toLowerCase().includes(termo)
    );
  }, [pedidos, busca]);

  const pedidosOrdenados = useMemo(
    () =>
      [...pedidosFiltrados].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [pedidosFiltrados]
  );

  const totalGasto = useMemo(
    () => pedidosFiltrados.reduce((acc, pedido) => acc + Number(pedido.valor_total), 0),
    [pedidosFiltrados]
  );

  const pedidosAtivos = useMemo(
    () => pedidosFiltrados.filter((pedido) => pedido.status !== "entregue").length,
    [pedidosFiltrados]
  );

  return (
    <Card className="app-panel">
      <CardHeader className="space-y-4 border-b border-border bg-muted/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Acompanhar pedidos</CardTitle>
            <CardDescription>
              Veja o andamento de cada pedido e acompanhe tudo em tempo real.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Atualizado automaticamente
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pedidos encontrados</p>
            <p className="text-xl font-semibold text-foreground">{pedidosFiltrados.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Em andamento</p>
            <p className="text-xl font-semibold text-foreground">{pedidosAtivos}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total no período</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(totalGasto)}</p>
          </div>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar pedido, item ou observação..."
            className="app-input h-10 pl-9 text-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {loading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Carregando seus pedidos...</p>
        ) : (
          <div className="space-y-4">
            {pedidosOrdenados.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                <PackageCheck className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Nenhum pedido encontrado com esse filtro.</p>
              </div>
            ) : (
              pedidosOrdenados.map((pedido) => {
                const statusIndex = STATUS_ORDER.indexOf(pedido.status);
                return (
                  <article
                    key={pedido.id}
                    className="rounded-2xl border border-border bg-background/80 p-4 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{pedido.item}</p>
                        <p className="text-xs text-muted-foreground">
                          Pedido em {formatDateTimeBR(pedido.created_at)} • {pedido.quantidade} unidade(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(Number(pedido.valor_total))}
                        </p>
                        <Badge
                          className={`${statusClassName(pedido.status)} mt-1 border-none px-2 py-0.5 text-[10px] font-bold`}
                        >
                          {statusLabel[pedido.status]}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {STATUS_ORDER.map((status, index) => {
                        const ativo = index <= statusIndex;
                        return (
                          <div key={status} className="flex flex-1 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: ativo
                                  ? statusTrackColor(pedido.status)
                                  : "rgb(156 163 175 / 0.3)",
                              }}
                              aria-hidden
                            />
                            {index < STATUS_ORDER.length - 1 ? (
                              <span
                                className="h-1 flex-1 rounded-full"
                                style={{
                                  backgroundColor:
                                    index < statusIndex
                                      ? statusTrackColor(pedido.status)
                                      : "rgb(156 163 175 / 0.2)",
                                  opacity: index < statusIndex ? 0.7 : 1,
                                }}
                                aria-hidden
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground">
                      {STATUS_ORDER.map((status) => (
                        <span key={status}>{statusLabel[status]}</span>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-border bg-muted/20 p-3 text-xs">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Cliente:</span> {pedido.cliente}
                      </p>
                      {pedido.telefone ? (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Contato:</span> {pedido.telefone}
                        </p>
                      ) : null}
                      {pedido.endereco ? (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Entrega:</span> {pedido.endereco}
                        </p>
                      ) : null}
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Data:</span> {formatDateBR(pedido.created_at)}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Observações:</span>{" "}
                        {pedido.descricao || pedido.observacao || "-"}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

