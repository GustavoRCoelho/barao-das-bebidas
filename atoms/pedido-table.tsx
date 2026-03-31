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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Pedido, PedidoStatus } from "@/lib/pedidos";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";

type PedidoTableProps = {
  pedidos: Pedido[];
  statusOptions: PedidoStatus[];
  statusLabel: Record<PedidoStatus, string>;
  statusClassName: (status: PedidoStatus) => string;
  formatCurrency: (value: number) => string;
  loading: boolean;
  onStatusChange: (id: string, status: PedidoStatus) => void;
  onDelete: (id: string) => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const STATUS_ORDER: PedidoStatus[] = ["pendente", "separacao", "enviado", "entregue"];

function statusTrackColor(status: PedidoStatus) {
  if (status === "pendente") return "#facc15";
  if (status === "separacao") return "#38bdf8";
  if (status === "enviado") return "#a78bfa";
  return "#34d399";
}

export function PedidoTable({
  pedidos,
  statusOptions,
  statusLabel,
  statusClassName,
  formatCurrency,
  loading,
  onStatusChange,
  onDelete,
  searchInput,
  onSearchChange,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PedidoTableProps) {
  const inicio = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const fim = Math.min(page * pageSize, total);

  return (
    <Card className="app-panel min-w-0 max-w-full overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="min-w-0 space-y-1.5">
          <CardTitle>Listagem de pedidos</CardTitle>
          <CardDescription>
            Gerencie o status em tempo real. Busca e paginação no servidor.
          </CardDescription>
        </div>
        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar cliente ou produto..."
            className="app-input pl-9"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4 pt-0">
        {loading ? (
          <PedidosListLoading variant="table" />
        ) : (
          <>
            <div className="max-h-[70vh] w-full max-w-full overflow-auto rounded-xl border border-border/80 shadow-sm">
              <Table className="w-full min-w-[920px]">
                <TableHeader className="bg-muted/50 dark:bg-muted/25">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[150px] uppercase tracking-wider text-[11px]">
                      Cliente
                    </TableHead>
                    <TableHead className="w-[180px] uppercase tracking-wider text-[11px]">
                      Pedido
                    </TableHead>
                    <TableHead className="w-[100px] uppercase tracking-wider text-[11px]">
                      Valor
                    </TableHead>
                    <TableHead className="min-w-[180px] uppercase tracking-wider text-[11px]">
                      Descrição
                    </TableHead>
                    <TableHead className="min-w-[200px] uppercase tracking-wider text-[11px]">
                      Status
                    </TableHead>
                    <TableHead className="w-[148px] text-right uppercase tracking-wider text-[11px]">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhum pedido nesta página. Ajuste a busca ou a página.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pedidos.map((pedido) => (
                      <TableRow key={pedido.id} className="align-top">
                        <TableCell className="py-4">
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {pedido.cliente}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">{pedido.telefone}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {pedido.item}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Qtd: {pedido.quantidade}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-sm font-medium tabular-nums text-foreground">
                          {formatCurrency(Number(pedido.valor_total))}
                        </TableCell>
                        <TableCell className="py-4 whitespace-normal">
                          <span className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {pedido.descricao?.trim() ? pedido.descricao : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`${statusClassName(pedido.status)} border-none px-2 py-0.5 text-[10px] font-bold`}
                          >
                            {statusLabel[pedido.status]}
                          </Badge>
                          <div className="mt-2 flex items-center gap-1.5">
                            {STATUS_ORDER.map((status, index) => {
                              const statusIndex = STATUS_ORDER.indexOf(pedido.status);
                              const ativo = index <= statusIndex;
                              return (
                                <div key={status} className="flex flex-1 items-center gap-1.5">
                                  <span
                                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor: ativo
                                        ? statusTrackColor(pedido.status)
                                        : "rgb(156 163 175 / 0.3)",
                                    }}
                                    aria-hidden
                                  />
                                  {index < STATUS_ORDER.length - 1 ? (
                                    <span
                                      className="h-0.5 flex-1 rounded-full"
                                      style={{
                                        backgroundColor: ativo
                                          ? statusTrackColor(pedido.status)
                                          : "rgb(156 163 175 / 0.2)",
                                        opacity: ativo ? 0.7 : 1,
                                      }}
                                      aria-hidden
                                    />
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right align-middle">
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <Select
                              value={pedido.status}
                              onValueChange={(value) => onStatusChange(pedido.id, value as PedidoStatus)}
                            >
                              <SelectTrigger className="app-input h-10 w-[120px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {statusLabel[status]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(pedido.id)}
                              className="text-muted-foreground hover:text-destructive size-9 shrink-0"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
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
