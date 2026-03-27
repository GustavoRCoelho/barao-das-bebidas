"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type UsuarioAdmin = {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "cliente";
};

type Options = {
  onError: (message: string) => void;
  isAdmin: boolean;
  activeTab: string;
};

export function useGerenciarUsuariosTab({ onError, isAdmin, activeTab }: Options) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await fetch("/api/usuarios", { cache: "no-store" });
      const data = (await response.json()) as UsuarioAdmin[] | { erro: string };

      if (!response.ok) {
        throw new Error("erro" in data ? data.erro : "Falha ao listar usuarios.");
      }

      setUsuarios(data as UsuarioAdmin[]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar usuarios.";
      onError(message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, onError]);

  useEffect(() => {
    if (isAdmin && activeTab === "gerenciar-usuarios") {
      fetchUsuarios();
    }
  }, [isAdmin, activeTab, fetchUsuarios]);

  const atualizarRole = useCallback(
    async (id: string, role: UsuarioAdmin["role"]) => {
      if (!isAdmin) return;

      setUpdatingId(id);
      try {
        const response = await fetch(`/api/usuarios/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

        const data = (await response.json()) as UsuarioAdmin | { erro: string };
        if (!response.ok) {
          throw new Error("erro" in data ? data.erro : "Falha ao atualizar role.");
        }

        const atualizado = data as UsuarioAdmin;
        setUsuarios((current) => current.map((u) => (u.id === id ? atualizado : u)));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nao foi possivel atualizar o usuario.";
        onError(message);
      } finally {
        setUpdatingId(null);
      }
    },
    [isAdmin, onError]
  );

  const filteredUsuarios = useMemo(() => usuarios, [usuarios]);

  return {
    usuarios: filteredUsuarios,
    loading,
    updatingId,
    fetchUsuarios,
    atualizarRole,
  };
}

