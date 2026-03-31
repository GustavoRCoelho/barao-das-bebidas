"use client";

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RelatorioResposta } from "@/lib/relatorios";

export type PeriodoRelatorio = "dia" | "semana" | "mes" | "personalizado";

type Options = {
  onError: (message: string) => void;
  isAdmin: boolean;
  activeTab: string;
};

function limitesPeriodo(
  tipo: PeriodoRelatorio,
  referencia: Date,
  customInicio: Date | null,
  customFim: Date | null
): { inicio: Date; fim: Date } {
  if (tipo === "dia") {
    return { inicio: startOfDay(referencia), fim: endOfDay(referencia) };
  }
  if (tipo === "semana") {
    return {
      inicio: startOfWeek(referencia, { weekStartsOn: 1, locale: ptBR }),
      fim: endOfWeek(referencia, { weekStartsOn: 1, locale: ptBR }),
    };
  }
  if (tipo === "mes") {
    return {
      inicio: startOfMonth(referencia),
      fim: endOfMonth(referencia),
    };
  }
  const ini = customInicio ? startOfDay(customInicio) : startOfDay(referencia);
  const fi = customFim ? endOfDay(customFim) : endOfDay(referencia);
  return ini <= fi ? { inicio: ini, fim: fi } : { inicio: fi, fim: ini };
}

export function useRelatoriosTab({ onError, isAdmin, activeTab }: Options) {
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>("dia");
  const [customInicio, setCustomInicio] = useState<Date | null>(null);
  const [customFim, setCustomFim] = useState<Date | null>(null);
  const [data, setData] = useState<RelatorioResposta | null>(null);
  const [loading, setLoading] = useState(false);

  const { inicio, fim } = useMemo(() => {
    const hoje = new Date();
    const cInicio = customInicio ?? hoje;
    const cFim = customFim ?? hoje;
    return limitesPeriodo(periodo, hoje, cInicio, cFim);
  }, [periodo, customInicio, customFim]);

  const fetchRelatorio = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      });
      const response = await fetch(`/api/relatorios?${params}`, { cache: "no-store" });
      const json = (await response.json()) as RelatorioResposta | { erro: string };
      if (!response.ok) {
        throw new Error("erro" in json ? json.erro : "Falha ao carregar relatorio.");
      }
      setData(json as RelatorioResposta);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar relatorio.";
      onError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, inicio, fim, onError]);

  useEffect(() => {
    if (isAdmin && activeTab === "relatorios") {
      fetchRelatorio();
    }
  }, [isAdmin, activeTab, fetchRelatorio]);

  useEffect(() => {
    if (periodo === "personalizado" && !customInicio && !customFim) {
      const hoje = new Date();
      setCustomInicio(startOfMonth(hoje));
      setCustomFim(endOfMonth(hoje));
    }
  }, [periodo, customInicio, customFim]);

  return {
    periodo,
    setPeriodo,
    customInicio,
    customFim,
    setCustomInicio,
    setCustomFim,
    intervalo: { inicio, fim },
    data,
    loading,
    refetch: fetchRelatorio,
  };
}
