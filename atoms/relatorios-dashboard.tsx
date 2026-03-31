"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  Package,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StatCard } from "@/atoms/stat-card";
import type { RelatorioPorCategoria, RelatorioResposta } from "@/lib/relatorios";
import type { PeriodoRelatorio } from "@/hooks/use-relatorios-tab";

const CORES_STATUS = {
  pendente: "var(--chart-status-pendente)",
  separacao: "var(--chart-status-separacao)",
  enviado: "var(--chart-status-enviado)",
  entregue: "var(--chart-status-entregue)",
};

const chartReceitaConfig = {
  receita: {
    label: "Receita (R$)",
    color: "var(--chart-receita)",
  },
} satisfies Record<string, { label: string; color: string }>;

const chartPedidosDiaConfig = {
  pedidos: {
    label: "Pedidos",
    color: "var(--chart-volume)",
  },
} satisfies Record<string, { label: string; color: string }>;

const chartCategoriaConfig = {
  receita: {
    label: "Receita (R$)",
    color: "var(--chart-receita)",
  },
} satisfies Record<string, { label: string; color: string }>;

const chartStatusConfig = {
  pendente: { label: "Pendente", color: CORES_STATUS.pendente },
  separacao: { label: "Separação", color: CORES_STATUS.separacao },
  enviado: { label: "Enviado", color: CORES_STATUS.enviado },
  entregue: { label: "Entregue", color: CORES_STATUS.entregue },
} satisfies Record<string, { label: string; color: string }>;

function moeda(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatarDataLabel(iso: string) {
  try {
    return format(new Date(iso + "T12:00:00"), "dd MMM", { locale: ptBR });
  } catch {
    return iso;
  }
}

type RelatoriosDashboardProps = {
  data: RelatorioResposta | null;
  loading: boolean;
  periodo: PeriodoRelatorio;
  onPeriodoChange: (p: PeriodoRelatorio) => void;
  customInicio: Date | null;
  customFim: Date | null;
  onCustomInicioChange: (d: Date | null) => void;
  onCustomFimChange: (d: Date | null) => void;
  intervalo: { inicio: Date; fim: Date };
  onRefresh: () => void;
};

export function RelatoriosDashboard({
  data,
  loading,
  periodo,
  onPeriodoChange,
  customInicio,
  customFim,
  onCustomInicioChange,
  onCustomFimChange,
  intervalo,
  onRefresh,
}: RelatoriosDashboardProps) {
  const resumo = data?.resumo;
  const pieData =
    data?.porStatus.filter((s) => s.quantidade > 0).map((s) => ({
      name: s.label,
      value: s.quantidade,
      status: s.status,
    })) ?? [];

  const serieComLabel =
    data?.serieTemporal.map((p) => ({
      ...p,
      labelCurto: formatarDataLabel(p.data),
    })) ?? [];

  const listaCategoria = data?.porCategoria ?? [];
  const porCategoriaChart = listaCategoria
    .slice()
    .reverse()
    .map((c) => ({
      ...c,
      nomeCurto: c.nome.length > 30 ? `${c.nome.slice(0, 28)}…` : c.nome,
    }));

  const alturaGraficoCategoria = Math.min(
    440,
    Math.max(180, listaCategoria.length * 36 + 48)
  );

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border-0 bg-white py-0 shadow-md ring-1 ring-black/[0.07] dark:bg-card dark:ring-border/70 dark:shadow-xl">
        <div className="pointer-events-none absolute -right-8 -top-12 size-40 rounded-full bg-primary/6 blur-2xl dark:bg-primary/10" aria-hidden />
        <CardHeader className="relative gap-4 border-b border-border/50 bg-white/85 px-5 pb-4 pt-5 dark:bg-card/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20">
                <CalendarRange className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold leading-tight sm:text-lg">
                  Filtro do período
                </CardTitle>
                <CardDescription className="mt-1 text-pretty">
                  Escolha um intervalo rápido ou defina datas personalizadas para o relatório.
                </CardDescription>
              </div>
            </div>
            <div className="flex w-full flex-col gap-1 rounded-xl border border-primary/15 bg-primary/[0.07] px-4 py-3 text-center shadow-sm dark:border-primary/25 dark:bg-primary/10 sm:w-auto sm:min-w-[220px] sm:text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Período aplicado
              </span>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground sm:text-base">
                {format(intervalo.inicio, "dd/MM/yyyy", { locale: ptBR })}
                <span className="mx-2 font-sans font-normal text-muted-foreground">—</span>
                {format(intervalo.fim, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-5 px-5 py-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Intervalo rápido
            </p>
            <div className="rounded-xl border border-border/60 bg-muted/25 p-2 shadow-inner dark:border-border/50 dark:bg-muted/20">
              <ToggleGroup
                type="single"
                value={periodo}
                onValueChange={(v) => {
                  if (v) onPeriodoChange(v as PeriodoRelatorio);
                }}
                className="flex w-full flex-wrap justify-stretch gap-1.5 sm:justify-start"
                variant="outline"
              >
                <ToggleGroupItem
                  value="dia"
                  aria-label="Hoje"
                  className="min-h-9 flex-1 px-3 sm:flex-none data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  Hoje
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="semana"
                  aria-label="Semana"
                  className="min-h-9 flex-1 px-3 sm:flex-none data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  Semana
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="mes"
                  aria-label="Mês"
                  className="min-h-9 flex-1 px-3 sm:flex-none data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  Mês
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="personalizado"
                  aria-label="Personalizado"
                  className="min-h-9 flex-1 px-3 sm:flex-none data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  <CalendarRange className="mr-1.5 size-4 shrink-0" />
                  Personalizado
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {periodo === "personalizado" ? (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Datas personalizadas
              </p>
              <div className="grid gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end dark:bg-muted/15">
                <div className="space-y-2">
                  <Label htmlFor="rel-inicio" className="text-xs font-medium text-foreground">
                    Data inicial
                  </Label>
                  <Input
                    id="rel-inicio"
                    type="date"
                    value={
                      customInicio
                        ? format(customInicio, "yyyy-MM-dd")
                        : format(intervalo.inicio, "yyyy-MM-dd")
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) {
                        onCustomInicioChange(null);
                        return;
                      }
                      onCustomInicioChange(new Date(v + "T12:00:00"));
                    }}
                    className="h-10 bg-white font-medium shadow-sm dark:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rel-fim" className="text-xs font-medium text-foreground">
                    Data final
                  </Label>
                  <Input
                    id="rel-fim"
                    type="date"
                    value={
                      customFim
                        ? format(customFim, "yyyy-MM-dd")
                        : format(intervalo.fim, "yyyy-MM-dd")
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) {
                        onCustomFimChange(null);
                        return;
                      }
                      onCustomFimChange(new Date(v + "T12:00:00"));
                    }}
                    className="h-10 bg-white font-medium shadow-sm dark:bg-background"
                  />
                </div>
                <Button
                  type="button"
                  variant="default"
                  onClick={onRefresh}
                  className="h-10 w-full gap-2 sm:w-auto sm:shrink-0"
                >
                  <RefreshCw className="size-4" />
                  Atualizar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Altere o intervalo acima ou recarregue os dados do período atual.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="gap-2 self-start shadow-sm sm:self-auto"
              >
                <RefreshCw className="size-4" />
                Atualizar dados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20">
          <Spinner className="size-6" />
          <span className="text-sm text-muted-foreground">Carregando indicadores…</span>
        </div>
      ) : null}

      {!loading && data && resumo ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Pedidos no período"
              value={resumo.totalPedidos}
              icon={LayoutDashboard}
              color="text-sky-400"
            />
            <StatCard
              title="Receita"
              value={moeda(resumo.receitaTotal)}
              icon={TrendingUp}
              color="text-emerald-400"
            />
            <StatCard
              title="Ticket médio"
              value={moeda(resumo.ticketMedio)}
              icon={BarChart3}
              color="text-violet-400"
            />
            <StatCard
              title="Unidades vendidas"
              value={resumo.unidadesVendidas}
              icon={Package}
              color="text-amber-400"
            />
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="app-soft-panel xl:col-span-2">
              <CardHeader>
                <CardTitle>Receita no tempo</CardTitle>
                <CardDescription>Evolução diária da receita no intervalo selecionado</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                {serieComLabel.length === 0 ? (
                  <p className="px-6 text-sm text-muted-foreground">Sem pedidos neste período.</p>
                ) : (
                  <ChartContainer config={chartReceitaConfig} className="h-[280px] w-full">
                    <AreaChart data={serieComLabel} margin={{ left: 8, right: 8 }}>
                      <defs>
                        <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="var(--color-receita)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-receita)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="labelCurto"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) =>
                          new Intl.NumberFormat("pt-BR", {
                            notation: v >= 1000 ? "compact" : "standard",
                            maximumFractionDigits: 0,
                          }).format(Number(v))
                        }
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => moeda(Number(value))}
                            labelFormatter={(_, payload) =>
                              payload?.[0]?.payload?.data
                                ? format(
                                    new Date((payload[0].payload as { data: string }).data + "T12:00:00"),
                                    "dd 'de' MMMM yyyy",
                                    { locale: ptBR }
                                  )
                                : ""
                            }
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="receita"
                        stroke="var(--color-receita)"
                        fill="url(#fillReceita)"
                        strokeWidth={2}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="app-soft-panel">
              <CardHeader>
                <CardTitle>Pedidos por status</CardTitle>
                <CardDescription>Distribuição no período</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem dados para exibir.</p>
                ) : (
                  <ChartContainer config={chartStatusConfig} className="mx-auto h-[260px] w-full max-w-[280px]">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={88}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              CORES_STATUS[entry.status as keyof typeof CORES_STATUS] ??
                              `var(--chart-${(index % 5) + 1})`
                            }
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={<ChartTooltipContent hideIndicator formatter={(v) => String(v)} />}
                      />
                      <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="app-soft-panel">
            <CardHeader>
              <CardTitle>Receita por categoria</CardTitle>
              <CardDescription>
                Baseada na categoria do produto vinculado a cada pedido no período
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              {porCategoriaChart.length === 0 ? (
                <p className="px-6 text-sm text-muted-foreground">
                  Sem dados por categoria neste período.
                </p>
              ) : (
                <ChartContainer
                  config={chartCategoriaConfig}
                  className="w-full"
                  style={{ height: alturaGraficoCategoria }}
                >
                  <BarChart
                    layout="vertical"
                    data={porCategoriaChart}
                    margin={{ left: 4, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(Number(v))
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="nomeCurto"
                      width={132}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload as RelatorioPorCategoria;
                        return (
                          <div className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm shadow-md">
                            <p className="font-medium text-foreground">{p.nome}</p>
                            <p className="mt-1 tabular-nums text-foreground">{moeda(p.receita)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {p.pedidos} pedidos · {p.unidades} un.
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="receita" radius={[0, 6, 6, 0]}>
                      {porCategoriaChart.map((_, i) => (
                        <Cell
                          key={`cat-${i}`}
                          fill={`var(--chart-${(i % 5) + 1})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="app-soft-panel">
              <CardHeader>
                <CardTitle>Volume de pedidos por dia</CardTitle>
                <CardDescription>Quantidade de pedidos registrados</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                {serieComLabel.length === 0 ? (
                  <p className="px-6 text-sm text-muted-foreground">Sem pedidos neste período.</p>
                ) : (
                  <ChartContainer config={chartPedidosDiaConfig} className="h-[240px] w-full">
                    <BarChart data={serieComLabel} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="labelCurto" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="pedidos" fill="var(--color-pedidos)" radius={[6, 6, 0, 0]} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="app-soft-panel">
              <CardHeader>
                <CardTitle>Itens com maior receita</CardTitle>
                <CardDescription>Até 8 produtos pelo valor total no período</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topItens.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem itens neste período.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.topItens.map((row, i) => (
                      <li
                        key={`${row.item}-${i}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate font-medium text-foreground">
                          {row.item}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {row.quantidade} un. · {moeda(row.receita)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {!loading && !data ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os relatórios. Verifique sua conexão e tente atualizar.
        </p>
      ) : null}
    </div>
  );
}
