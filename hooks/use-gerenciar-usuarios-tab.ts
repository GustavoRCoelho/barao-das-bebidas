"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListaUsuariosPaginadaResposta, UsuarioAdmin } from "@/lib/usuarios-admin";
import { toast } from "sonner";

export type { UsuarioAdmin };

type Options = {
  onError: (message: string) => void;
  isAdmin: boolean;
  activeTab: string;
};

export function useGerenciarUsuariosTab({ onError, isAdmin, activeTab }: Options) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [debNome, setDebNome] = useState("");
  const [debEmail, setDebEmail] = useState("");
  const pageRef = useRef(1);

  useEffect(() => {
    const id = window.setTimeout(() => setDebNome(filtroNome), 380);
    return () => window.clearTimeout(id);
  }, [filtroNome]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebEmail(filtroEmail), 380);
    return () => window.clearTimeout(id);
  }, [filtroEmail]);

  const loadPage = useCallback(
    async (
      targetPage: number,
      opts?: { silent?: boolean; nomeOverride?: string; emailOverride?: string }
    ) => {
      if (!isAdmin) return;

      const nomeQ = opts?.nomeOverride !== undefined ? opts.nomeOverride : debNome;
      const emailQ = opts?.emailOverride !== undefined ? opts.emailOverride : debEmail;

      if (!opts?.silent) setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          pageSize: String(pageSize),
        });
        if (nomeQ.trim()) params.set("nome", nomeQ.trim());
        if (emailQ.trim()) params.set("email", emailQ.trim());

        const response = await fetch(`/api/usuarios?${params}`, { cache: "no-store" });
        const data = (await response.json()) as ListaUsuariosPaginadaResposta | { erro: string };

        if (!response.ok) {
          throw new Error("erro" in data ? data.erro : "Falha ao listar usuarios.");
        }

        const body = data as ListaUsuariosPaginadaResposta;
        setUsuarios(body.usuarios);
        setTotal(body.total);
        setPage(body.page);
        pageRef.current = body.page;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nao foi possivel carregar usuarios.";
        onError(message);
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [isAdmin, onError, pageSize, debNome, debEmail]
  );

  useEffect(() => {
    if (!isAdmin || activeTab !== "gerenciar-usuarios") return;
    setPage(1);
    pageRef.current = 1;
    void loadPage(1);
  }, [isAdmin, activeTab, debNome, debEmail, pageSize, loadPage]);

  const fetchUsuarios = useCallback(async () => {
    setFiltroNome("");
    setFiltroEmail("");
    setDebNome("");
    setDebEmail("");
    setPage(1);
    pageRef.current = 1;
    await loadPage(1, { nomeOverride: "", emailOverride: "" });
  }, [loadPage]);

  const goToPage = useCallback(
    (p: number) => {
      void loadPage(Math.max(1, p));
    },
    [loadPage]
  );

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
        toast.success("Perfil de usuario atualizado com sucesso.");
        void loadPage(pageRef.current, { silent: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Nao foi possivel atualizar o usuario.";
        toast.error(message);
        onError(message);
      } finally {
        setUpdatingId(null);
      }
    },
    [isAdmin, onError, loadPage]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  return {
    usuarios,
    loading,
    updatingId,
    fetchUsuarios,
    atualizarRole,
    page,
    pageSize,
    total,
    totalPages,
    goToPage,
    setPageSize,
    filtroNome,
    setFiltroNome,
    filtroEmail,
    setFiltroEmail,
  };
}
