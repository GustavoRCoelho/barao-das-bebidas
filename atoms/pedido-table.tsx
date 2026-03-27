"use client";

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
import { MoreHorizontal, Search } from "lucide-react";
import { useMemo, useState } from "react";

type PedidoTableProps = {
  pedidos: Pedido[];
  statusOptions: PedidoStatus[];
  statusLabel: Record<PedidoStatus, string>;
  statusClassName: (status: PedidoStatus) => string;
  formatCurrency: (value: number) => string;
  loading: boolean;
  onStatusChange: (id: string, status: PedidoStatus) => void;
  onDelete: (id: string) => void;
};

export function PedidoTable({
  pedidos,
  statusOptions,
  statusLabel,
  statusClassName,
  formatCurrency,
  loading,
  onStatusChange,
  onDelete,
}: PedidoTableProps) {
  const [busca, setBusca] = useState("");

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pedidos;
    return pedidos.filter(
      (pedido) =>
        pedido.cliente.toLowerCase().includes(termo) || pedido.item.toLowerCase().includes(termo)
    );
  }, [pedidos, busca]);

  return (
    <Card className="app-panel">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">Listagem de Pedidos</CardTitle>
          <CardDescription>Gerencie o status em tempo real.</CardDescription>
        </div>
        <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar cliente ou produto..."
            className="app-input h-9 pl-9 text-xs"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="text-muted-foreground p-4 text-sm">Carregando pedidos...</p>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Cliente</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Pedido</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Valor</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Descrição</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Status</TableHead>
                <TableHead className="text-muted-foreground text-right text-[10px] font-bold uppercase">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.map((pedido) => (
                <TableRow key={pedido.id} className="border-border transition-colors hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-medium text-foreground">{pedido.cliente}</p>
                    <p className="text-muted-foreground text-[10px]">{pedido.telefone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">{pedido.item}</p>
                    <p className="text-muted-foreground text-[10px]">Qtd: {pedido.quantidade}</p>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    {formatCurrency(Number(pedido.valor_total))}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="text-xs text-muted-foreground">{pedido.descricao || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusClassName(pedido.status)} border-none px-2 py-0.5 text-[10px] font-bold`}>
                      {statusLabel[pedido.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select
                        value={pedido.status}
                        onValueChange={(value) => onStatusChange(pedido.id, value as PedidoStatus)}
                      >
                        <SelectTrigger className="app-input h-8 w-[120px] text-[11px]">
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
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
