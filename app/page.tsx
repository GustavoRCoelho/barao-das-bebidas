"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardHeader } from "@/atoms/dashboard-header";
import { CardapioTable } from "@/atoms/cardapio-table";
import { GerenciarCardapio } from "@/atoms/gerenciar-cardapio";
import { PedidoForm } from "@/atoms/pedido-form";
import type { PedidoFormState } from "@/atoms/pedido-form";
import { PedidoTable } from "@/atoms/pedido-table";
import { SidebarNav } from "@/atoms/sidebar-nav";
import { StatCard } from "@/atoms/stat-card";
import {
  AlertCircle,
  BarChart3,
  Beer,
  BookOpen,
  ClipboardList,
  DollarSign,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Settings2,
  ShoppingCart,
  UserCog,
} from "lucide-react";
import { useCardapioTab } from "@/hooks/use-cardapio-tab";
import { useCriarPedidoTab } from "@/hooks/use-criar-pedido-tab";
import { useGerenciarCardapioTab } from "@/hooks/use-gerenciar-cardapio-tab";
import { useGerenciarPedidosTab } from "@/hooks/use-gerenciar-pedidos-tab";
import { useMeusPedidosTab } from "@/hooks/use-meus-pedidos-tab";
import { useGerenciarUsuariosTab } from "@/hooks/use-gerenciar-usuarios-tab";
import type { Produto } from "@/lib/produtos";
import type { PedidoStatus } from "@/lib/pedidos";
import { GerenciarUsuarios } from "@/atoms/gerenciar-usuarios";
import { MeusPedidos } from "@/atoms/meus-pedidos";
import { RelatoriosDashboard } from "@/atoms/relatorios-dashboard";
import { useRelatoriosTab } from "@/hooks/use-relatorios-tab";

type UsuarioInfo = {
  nome: string;
  role: "admin" | "cliente";
};

type Aba =
  | "cardapio"
  | "criar"
  | "acompanhar"
  | "gerenciar-cardapio"
  | "gerenciar"
  | "relatorios"
  | "gerenciar-usuarios";

const STATUS_OPTIONS: PedidoStatus[] = ["pendente", "separacao", "enviado", "entregue"];

const STATUS_LABEL: Record<PedidoStatus, string> = {
  pendente: "Pendente",
  separacao: "Em separacao",
  enviado: "Enviado",
  entregue: "Entregue",
};

function moeda(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function statusClassName(status: PedidoStatus) {
  if (status === "pendente") {
    return "border-amber-300/70 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200";
  }
  if (status === "separacao") {
    return "border-sky-300/70 bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200";
  }
  if (status === "enviado") {
    return "border-violet-300/70 bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200";
  }
  return "border-emerald-300/70 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200";
}

export default function HomePage() {
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [sidebarCompacto, setSidebarCompacto] = useState(false);
  const [sidebarMobileAberta, setSidebarMobileAberta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<Aba>("criar");

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const cardapioTab = useCardapioTab({
    onError: handleError,
  });

  const gerenciarPedidosTab = useGerenciarPedidosTab({
    onError: handleError,
    isAdmin: usuario?.role === "admin",
    activeTab: abaAtiva,
  });

  const meusPedidosTab = useMeusPedidosTab({
    enabled: Boolean(usuario) && abaAtiva === "acompanhar",
    onError: handleError,
  });

  const criarPedidoTab = useCriarPedidoTab({
    onError: handleError,
    onSuccess: async () => {
      if (usuario?.role === "admin") {
        setAbaAtiva("gerenciar");
        await gerenciarPedidosTab.fetchPedidos();
      } else {
        setAbaAtiva("acompanhar");
        await meusPedidosTab.fetchMeusPedidos();
      }
    },
  });

  const gerenciarCardapioTab = useGerenciarCardapioTab({
    onProdutoAtualizado: (produtoAtualizado: Produto) =>
      cardapioTab.atualizarProduto(produtoAtualizado),
    onProdutoExcluido: (produtoId: string) => cardapioTab.removerProduto(produtoId),
  });

  const gerenciarUsuariosTab = useGerenciarUsuariosTab({
    onError: handleError,
    isAdmin: usuario?.role === "admin",
    activeTab: abaAtiva,
  });

  const relatoriosTab = useRelatoriosTab({
    onError: handleError,
    isAdmin: usuario?.role === "admin",
    activeTab: abaAtiva,
  });

  const handlePedidoFormChange = useCallback(
    (field: keyof PedidoFormState, value: string) => {
      criarPedidoTab.setForm((current) => {
        if (current[field] === value) {
          return current;
        }
        return {
          ...current,
          [field]: value,
        };
      });
    },
    [criarPedidoTab.setForm]
  );

  useEffect(() => {
    async function carregarUsuario() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as UsuarioInfo;
      setUsuario(data);
    }
    carregarUsuario();
  }, []);

  useEffect(() => {
    if (usuario) {
      cardapioTab.fetchProdutos();
    }
  }, [usuario, cardapioTab.fetchProdutos]);

  useEffect(() => {
    if (!usuario?.nome) return;
    criarPedidoTab.setForm((current) => {
      if (current.cliente === usuario.nome) {
        return current;
      }
      return {
        ...current,
        cliente: usuario.nome,
      };
    });
  }, [usuario?.nome, criarPedidoTab.setForm]);

  useEffect(() => {
    if (!usuario || usuario.role === "admin") return;
    if (abaAtiva === "relatorios") {
      setAbaAtiva("criar");
    }
  }, [usuario, abaAtiva]);

  function selecionarAba(id: Aba) {
    if (id === "relatorios" && usuario?.role !== "admin") {
      return;
    }
    setAbaAtiva(id);
  }

  async function sair() {
    setSaindo(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth";
  }

  const menu = [
    { id: "cardapio" as const, label: "Cardápio", icon: BookOpen },
    { id: "criar" as const, label: "Fazer pedidos", icon: PlusCircle },
    { id: "acompanhar" as const, label: "Acompanhar pedidos", icon: ClipboardList },
    ...(usuario?.role === "admin"
      ? [
        { id: "gerenciar-cardapio" as const, label: "Gerenciar cardápio", icon: Settings2 },
        { id: "gerenciar" as const, label: "Gerenciar pedidos", icon: ClipboardList },
        { id: "gerenciar-usuarios" as const, label: "Gerenciar usuários", icon: UserCog },
        { id: "relatorios" as const, label: "Relatórios", icon: BarChart3 },
      ]
      : []),
  ];

  return (
    <main className="app-shell selection:bg-primary/20 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="app-orb-cyan" />
        <div className="app-orb-violet" />
      </div>

      <div
        className={`relative w-full pl-0 transition-all ${
          sidebarCompacto ? "md:pl-[78px]" : "md:pl-[260px]"
        }`}
      >
        <SidebarNav
          menu={menu}
          abaAtiva={
            abaAtiva as
              | "cardapio"
              | "criar"
              | "acompanhar"
              | "gerenciar-cardapio"
              | "gerenciar"
              | "relatorios"
              | "gerenciar-usuarios"
          }
          onSelectAba={(id) => selecionarAba(id as Aba)}
          usuarioNome={usuario?.nome}
          usuarioRole={usuario?.role}
          saindo={saindo}
          onLogout={sair}
          compacto={sidebarCompacto}
          onToggleCompact={() => setSidebarCompacto((atual) => !atual)}
          mobileOpen={sidebarMobileAberta}
          onCloseMobile={() => setSidebarMobileAberta(false)}
        />

        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
          <div className="space-y-8">
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setSidebarMobileAberta((atual) => !atual)}
                className="app-soft-panel inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                {sidebarMobileAberta ? (
                  <PanelLeftClose className="size-4" />
                ) : (
                  <PanelLeftOpen className="size-4" />
                )}
                Menu
              </button>
            </div>
            <DashboardHeader
              abaAtiva={abaAtiva}
              totalFaturado={moeda(gerenciarPedidosTab.totalFaturado)}
              totalPedidos={gerenciarPedidosTab.pedidos.length}
              showStats={Boolean(usuario?.role === "admin" && abaAtiva === "gerenciar")}
            />

            {usuario?.role === "admin" && abaAtiva === "gerenciar" && (
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total"
                  value={gerenciarPedidosTab.pedidos.length}
                  icon={ShoppingCart}
                  color="text-blue-400"
                />
                <StatCard
                  title="Em Aberto"
                  value={gerenciarPedidosTab.totalEmAberto}
                  icon={Beer}
                  color="text-amber-400"
                />
                <StatCard
                  title="Entregues"
                  value={gerenciarPedidosTab.totalEntregues}
                  icon={PackageCheck}
                  color="text-emerald-400"
                />
                <StatCard
                  title="Receita"
                  value={moeda(gerenciarPedidosTab.totalFaturado)}
                  icon={DollarSign}
                  color="text-violet-400"
                />
              </section>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {abaAtiva === "cardapio" ? (
                <CardapioTable produtos={cardapioTab.produtos} />
              ) : abaAtiva === "criar" ? (
                <PedidoForm
                  form={criarPedidoTab.form}
                  produtos={cardapioTab.produtos}
                  salvando={criarPedidoTab.salvando}
                  onSubmit={criarPedidoTab.submitPedido}
                  onChange={handlePedidoFormChange}
                />
              ) : abaAtiva === "acompanhar" ? (
                <MeusPedidos
                  pedidos={meusPedidosTab.pedidos}
                  loading={meusPedidosTab.loading}
                  statusLabel={STATUS_LABEL}
                  statusClassName={statusClassName}
                  formatCurrency={moeda}
                />
              ) : abaAtiva === "gerenciar-cardapio" ? (
                <GerenciarCardapio
                  produtos={cardapioTab.produtos}
                  onProdutoAtualizado={gerenciarCardapioTab.handleProdutoAtualizado}
                  onProdutoExcluido={gerenciarCardapioTab.handleProdutoExcluido}
                />
              ) : abaAtiva === "gerenciar-usuarios" ? (
                <GerenciarUsuarios
                  usuarios={gerenciarUsuariosTab.usuarios}
                  loading={gerenciarUsuariosTab.loading}
                  updatingId={gerenciarUsuariosTab.updatingId}
                  onRoleChange={gerenciarUsuariosTab.atualizarRole}
                />
              ) : abaAtiva === "relatorios" && usuario?.role === "admin" ? (
                <RelatoriosDashboard
                  data={relatoriosTab.data}
                  loading={relatoriosTab.loading}
                  periodo={relatoriosTab.periodo}
                  onPeriodoChange={relatoriosTab.setPeriodo}
                  customInicio={relatoriosTab.customInicio}
                  customFim={relatoriosTab.customFim}
                  onCustomInicioChange={relatoriosTab.setCustomInicio}
                  onCustomFimChange={relatoriosTab.setCustomFim}
                  intervalo={relatoriosTab.intervalo}
                  onRefresh={relatoriosTab.refetch}
                />
              ) : (
                <PedidoTable
                  pedidos={gerenciarPedidosTab.pedidos}
                  statusOptions={STATUS_OPTIONS}
                  statusLabel={STATUS_LABEL}
                  statusClassName={statusClassName}
                  formatCurrency={moeda}
                  loading={gerenciarPedidosTab.loading}
                  onStatusChange={gerenciarPedidosTab.atualizarStatus}
                  onDelete={gerenciarPedidosTab.excluirPedido}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}