"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";

type MenuItem = {
  id:
    | "cardapio"
    | "criar"
    | "acompanhar"
    | "gerenciar-cardapio"
    | "gerenciar"
    | "gerenciar-usuarios";
  label: string;
  icon: LucideIcon;
};

type SidebarNavProps = {
  menu: MenuItem[];
  abaAtiva:
    | "cardapio"
    | "criar"
    | "acompanhar"
    | "gerenciar-cardapio"
    | "gerenciar"
    | "gerenciar-usuarios";
  onSelectAba: (
    id:
      | "cardapio"
      | "criar"
      | "acompanhar"
      | "gerenciar-cardapio"
      | "gerenciar"
      | "gerenciar-usuarios"
  ) => void;
  usuarioNome?: string;
  usuarioRole?: "admin" | "cliente";
  saindo: boolean;
  onLogout: () => void;
  compacto?: boolean;
  onToggleCompact?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

export function SidebarNav({
  menu,
  abaAtiva,
  onSelectAba,
  usuarioNome,
  usuarioRole,
  saindo,
  onLogout,
  compacto = false,
  onToggleCompact,
  mobileOpen = false,
  onCloseMobile,
}: SidebarNavProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/45 md:hidden"
        />
      ) : null}
      <aside
        className={`app-panel fixed left-0 top-0 z-40 flex h-screen flex-col gap-6 overflow-y-auto rounded-tr-xl rounded-br-xl rounded-tl-none rounded-bl-none transition-[width,padding,transform] duration-200 ${
          compacto ? "w-[78px] p-3" : "w-[260px] p-4"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
      <div
        className={`flex items-center gap-3 ${compacto ? "px-0 justify-center" : "px-2"}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`overflow-hidden rounded-xl border border-border bg-black/30 ${
              compacto ? "h-11 w-11" : "h-12 w-12"
            }`}
          >
            <Image
              src="/logo.png"
              alt="Logo Barão das Bebidas"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          {compacto ? null : (
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold tracking-tight text-foreground">
                Barão das Bebidas
              </h2>
            </div>
          )}
        </div>
      </div>

      {onToggleCompact ? (
        <div className={compacto ? "px-0" : "px-2"}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleCompact}
            disabled={saindo}
            className={`w-full ${
              compacto
                ? "justify-center px-0 bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "justify-start gap-2"
            }`}
          >
            {compacto ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!compacto ? (saindo ? "Processando..." : "Recolher Navegação") : null}
          </Button>
        </div>
      ) : null}

      <nav className="space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const ativo = abaAtiva === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectAba(item.id);
                onCloseMobile?.();
              }}
              className={`group flex w-full items-center gap-3 rounded-xl transition-all duration-200 ${
                compacto ? "justify-center px-0 py-2.5" : "px-4 py-2.5"
              } text-sm font-medium ${
                ativo
                  ? "ring-1 ring-border bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`size-4 transition-colors ${
                  ativo ? "text-primary" : "group-hover:text-foreground"
                }`}
              />
              {compacto ? null : item.label}
            </button>
          );
        })}
      </nav>

      <div className="app-soft-panel mt-auto space-y-4 p-4">
        {!compacto ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-foreground">
                {usuarioNome || "Usuário"}
              </p>
              <Badge
                variant="outline"
                className="h-4 border-none bg-primary/10 px-1 text-[9px] text-primary"
              >
                {(usuarioRole ?? "cliente").toUpperCase()}
              </Badge>
            </div>
          </div>
        ) : null}

        {!compacto ? (
          <ThemeToggle className="w-full justify-start gap-2" />
        ) : (
          <ThemeToggle compacto className="w-full justify-center px-0" />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          disabled={saindo}
          className={`w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive ${
            compacto ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut className="size-4" />
          {compacto ? null : saindo ? "Saindo..." : "Sair do sistema"}
        </Button>
      </div>
    </aside>
    </>
  );
}
