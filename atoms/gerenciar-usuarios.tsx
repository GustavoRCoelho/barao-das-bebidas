"use client";

import { useMemo, useState } from "react";
import type { UsuarioAdmin } from "@/hooks/use-gerenciar-usuarios-tab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

type Props = {
  usuarios: UsuarioAdmin[];
  loading: boolean;
  updatingId: string | null;
  onRoleChange: (id: string, role: UsuarioAdmin["role"]) => void;
};

export function GerenciarUsuarios({ usuarios, loading, updatingId, onRoleChange }: Props) {
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");

  const usuariosFiltrados = useMemo(() => {
    const nomeTermo = filtroNome.trim().toLowerCase();
    const emailTermo = filtroEmail.trim().toLowerCase();

    return usuarios.filter((u) => {
      const passouNome = !nomeTermo || u.nome.toLowerCase().includes(nomeTermo);
      const passouEmail = !emailTermo || u.email.toLowerCase().includes(emailTermo);
      return passouNome && passouEmail;
    });
  }, [usuarios, filtroNome, filtroEmail]);

  return (
    <Card className="app-panel">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Gerenciar usuários</CardTitle>
            <CardDescription>Liste, filtre e altere a permissão (admin/cliente).</CardDescription>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="app-input pl-9"
              placeholder="Filtrar por nome..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="app-input pl-9"
              placeholder="Filtrar por email..."
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Carregando usuarios...</p>
        ) : (
          <div className="max-h-[65vh] w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[170px]">Permissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value) => onRoleChange(u.id, value as UsuarioAdmin["role"])}
                          disabled={updatingId === u.id}
                        >
                          <SelectTrigger className="app-input h-8 w-[150px] text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="cliente">cliente</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

