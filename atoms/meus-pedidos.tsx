"use client";

import { PedidosListLoading } from "@/atoms/pedidos-list-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PedidosResumo } from "@/lib/pedidos-listagem";
import type { Pedido, PedidoStatus } from "@/lib/pedidos";
import { ChevronLeft, ChevronRight, Clock3, PackageCheck, Search } from "lucide-react";

type Props = {
  pedidos: Pedido[];
  loading: boolean;
  statusLabel: Record<PedidoStatus, string>;
  statusClassName: (status: PedidoStatus) => string;
  formatCurrency: (value: number) => string;
  resumo: PedidosResumo;
  searchInput: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
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

export function MeusPedidos({
  pedidos,
  loading,
  statusLabel,
  statusClassName,
  formatCurrency,
  resumo,
  searchInput,
  onSearchChange,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const inicio = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const fim = Math.min(page * pageSize, total);

  return (
    <Card className="app-panel">
      <CardHeader className="space-y-4 border-b border-border bg-muted/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Acompanhar pedidos</CardTitle>
            <CardDescription>
              Veja o andamento de cada pedido com busca e páginas.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Atualizado ao mudar filtros
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pedidos (filtro atual)</p>
            <p className="text-xl font-semibold text-foreground">{resumo.totalPedidos}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Em andamento</p>
            <p className="text-xl font-semibold text-foreground">{resumo.totalEmAberto}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total no filtro</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(resumo.totalFaturado)}</p>
          </div>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar pedido, item ou observação..."
            className="app-input h-10 pl-9 text-sm"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {loading ? (
          <PedidosListLoading variant="cards" message="Carregando seus pedidos…" />
        ) : (
          <>
            <div className="space-y-4">
              {pedidos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                  <PackageCheck className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhum pedido nesta página. Ajuste a busca ou tente outra página.
                  </p>
                </div>
              ) : (
                pedidos.map((pedido) => {
                  const statusIndex = STATUS_ORDER.indexOf(pedido.status);
                  return (
                    <article
                      key={pedido.id}
                      data-testid="e2e-meus-pedido-card"
                      className="rounded-2xl border border-border bg-background/80 p-4 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{pedido.item}</p>
                          <p className="text-xs text-muted-foreground">
                            Pedido em {formatDateTimeBR(pedido.created_at)} • {pedido.quantidade}{" "}
                            unidade(s)
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
                            <span className="font-medium text-foreground">Contato:</span>{" "}
                            {pedido.telefone}
                          </p>
                        ) : null}
                        {pedido.endereco ? (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Entrega:</span>{" "}
                            {pedido.endereco}
                          </p>
                        ) : null}
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Data:</span>{" "}
                          {formatDateBR(pedido.created_at)}
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

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs tabular-nums">
                {total === 0 ? (
                  "Nenhum pedido para exibir."
                ) : (
                  <>
                    Mostrando <span className="font-medium text-foreground">{inicio}</span>–
                    <span className="font-medium text-foreground">{fim}</span> de{" "}
                    <span className="font-medium text-foreground">{total}</span> pedidos
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => onPageSizeChange(Number(v))}
                >
                  <SelectTrigger className="app-input h-8 w-[118px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / página</SelectItem>
                    <SelectItem value="20">20 / página</SelectItem>
                    <SelectItem value="50">50 / página</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1 || loading}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-muted-foreground min-w-28 px-1 text-center text-xs tabular-nums">
                    Página {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages || loading}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
