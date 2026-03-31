"use client";

import { PedidosListLoading } from "@/atoms/pedidos-list-loading";
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
import type { UsuarioAdmin } from "@/lib/usuarios-admin";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

type Props = {
  usuarios: UsuarioAdmin[];
  loading: boolean;
  updatingId: string | null;
  onRoleChange: (id: string, role: UsuarioAdmin["role"]) => void;
  filtroNome: string;
  onFiltroNomeChange: (value: string) => void;
  filtroEmail: string;
  onFiltroEmailChange: (value: string) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function GerenciarUsuarios({
  usuarios,
  loading,
  updatingId,
  onRoleChange,
  filtroNome,
  onFiltroNomeChange,
  filtroEmail,
  onFiltroEmailChange,
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
    <Card className="app-panel min-w-0 max-w-full overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="min-w-0 space-y-1.5">
          <CardTitle>Gerenciar usuários</CardTitle>
          <CardDescription>
            Filtros por nome e e-mail no servidor. Altere a permissão quando necessário.
          </CardDescription>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="app-input pl-9"
              placeholder="Filtrar por nome..."
              value={filtroNome}
              onChange={(e) => onFiltroNomeChange(e.target.value)}
            />
          </div>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="app-input pl-9"
              placeholder="Filtrar por email..."
              value={filtroEmail}
              onChange={(e) => onFiltroEmailChange(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-w-0 space-y-4 pt-0">
        {loading ? (
          <PedidosListLoading variant="table" message="Carregando usuários…" />
        ) : (
          <>
            <div className="max-h-[70vh] w-full max-w-full overflow-auto rounded-xl border border-border/80 shadow-sm">
              <Table className="w-full min-w-[720px]">
                <TableHeader className="bg-muted/50 dark:bg-muted/25">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] uppercase tracking-wider text-[11px]">Nome</TableHead>
                    <TableHead className="min-w-[240px] uppercase tracking-wider text-[11px]">
                      Email
                    </TableHead>
                    <TableHead className="w-[160px] text-right uppercase tracking-wider text-[11px]">
                      Permissão
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-10 text-center text-sm text-muted-foreground whitespace-normal"
                      >
                        Nenhum usuário nesta página. Ajuste filtros ou a página.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuarios.map((u) => (
                      <TableRow key={u.id} className="align-top">
                        <TableCell className="py-4">
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {u.nome}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-md py-4 whitespace-normal">
                          <span className="block break-all text-sm leading-relaxed text-muted-foreground">
                            {u.email}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right align-middle">
                          <div className="flex justify-end">
                            <Select
                              value={u.role}
                              onValueChange={(value) =>
                                onRoleChange(u.id, value as UsuarioAdmin["role"])
                              }
                              disabled={updatingId === u.id}
                            >
                              <SelectTrigger className="app-input h-10 w-[140px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">admin</SelectItem>
                                <SelectItem value="cliente">cliente</SelectItem>
                              </SelectContent>
                            </Select>
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
                  "Nenhum usuário para exibir."
                ) : (
                  <>
                    Mostrando <span className="font-medium text-foreground">{inicio}</span>–
                    <span className="font-medium text-foreground">{fim}</span> de{" "}
                    <span className="font-medium text-foreground">{total}</span> usuários
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
