"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
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

export function MeusPedidos({ pedidos, loading, statusLabel, statusClassName, formatCurrency }: Props) {
  const [busca, setBusca] = useState("");

  const pedidosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pedidos;
    return pedidos.filter((p) => p.cliente.toLowerCase().includes(termo) || p.item.toLowerCase().includes(termo));
  }, [pedidos, busca]);

  return (
    <Card className="app-panel">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">Acompanhar pedidos</CardTitle>
          <CardDescription>Histórico dos seus pedidos e status atual.</CardDescription>
        </div>

        <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar no histórico..."
            className="app-input h-9 pl-9 text-xs"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <p className="text-muted-foreground p-4 text-sm">Carregando seus pedidos...</p>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Data</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Pedido</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Valor</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Descrição</TableHead>
                <TableHead className="text-muted-foreground text-[10px] font-bold uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <TableRow key={pedido.id} className="border-border transition-colors hover:bg-muted/30">
                    <TableCell className="py-4 text-muted-foreground text-[11px]">{formatDateBR(pedido.created_at)}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{pedido.cliente}</p>
                      <p className="text-xs text-muted-foreground">{pedido.item}</p>
                      <p className="text-[11px] text-muted-foreground">Qtd total: {pedido.quantidade}</p>
                      {pedido.telefone ? (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{pedido.telefone}</p>
                      ) : null}
                      {pedido.endereco ? (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{pedido.endereco}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(pedido.valor_total))}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <p className="text-xs text-muted-foreground">{pedido.descricao || "-"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusClassName(pedido.status)} border-none px-2 py-0.5 text-[10px] font-bold`}>
                        {statusLabel[pedido.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

