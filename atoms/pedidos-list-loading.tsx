"use client";

import { cn } from "@/lib/utils";
import { PackageSearch } from "lucide-react";

type Variant = "table" | "cards";

type Props = {
  variant: Variant;
  message?: string;
  className?: string;
};

export function PedidosListLoading({ variant, message, className }: Props) {
  const texto = message ?? "Carregando pedidos…";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden py-10",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <div className="pedidos-load-aurora absolute -left-1/4 top-1/2 size-[280px] -translate-y-1/2 rounded-full bg-primary/25 blur-3xl dark:bg-primary/15" />
        <div
          className="pedidos-load-aurora absolute -right-1/4 top-1/3 size-[240px] rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10"
          style={{ animationDelay: "2.5s" }}
        />
      </div>

      <div className="relative mb-8 flex size-20 items-center justify-center">
        <span className="absolute inline-flex size-16 rounded-full bg-primary/20 animate-ping" />
        <span
          className="absolute inline-flex size-12 animate-pulse rounded-full bg-primary/30"
          style={{ animationDelay: "150ms" }}
        />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-background/90 shadow-lg ring-4 ring-primary/10 backdrop-blur-sm dark:bg-card/90">
          <PackageSearch className="size-7 text-primary animate-[pedidos-icon-bob_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      <p className="relative text-sm font-medium text-foreground">{texto}</p>
      <p className="relative mt-1 max-w-xs text-center text-xs text-muted-foreground">
        Aguarde um instante enquanto organizamos suas informações.
      </p>

      <div className="relative mt-10 w-full max-w-2xl space-y-3 px-4">
        {variant === "table"
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="pedidos-skeleton-row flex gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 dark:bg-muted/10"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-10 flex-1 rounded-md bg-muted/60 pedidos-shimmer" />
                <div className="h-10 w-24 rounded-md bg-muted/50 pedidos-shimmer" />
                <div className="h-10 w-28 rounded-md bg-muted/50 pedidos-shimmer" />
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="pedidos-skeleton-row space-y-3 rounded-2xl border border-border/50 bg-muted/15 p-4 dark:bg-muted/10"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-3">
                  <div className="h-5 flex-1 rounded-md bg-muted/60 pedidos-shimmer" />
                  <div className="h-5 w-20 rounded-md bg-muted/50 pedidos-shimmer" />
                </div>
                <div className="h-3 w-full rounded-md bg-muted/40 pedidos-shimmer" />
                <div className="h-16 w-full rounded-xl bg-muted/35 pedidos-shimmer" />
              </div>
            ))}
      </div>
    </div>
  );
}
