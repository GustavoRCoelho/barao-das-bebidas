import { NextResponse } from "next/server";
import { format, parseISO } from "date-fns";
import { obterUsuarioSessao } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase";
import type { Pedido, PedidoStatus } from "@/lib/pedidos";
import type {
  RelatorioPorCategoria,
  RelatorioPorStatus,
  RelatorioResposta,
  RelatorioSeriePonto,
  RelatorioTopItem,
} from "@/lib/relatorios";

const STATUS_LABEL: Record<PedidoStatus, string> = {
  pendente: "Pendente",
  separacao: "Em separação",
  enviado: "Enviado",
  entregue: "Entregue",
};

type ProdutoCatRow = {
  id: string;
  categoria_id: string | null;
  categoria: { id: string; nome: string } | null;
};

type LookupProdutoCategoria = Map<
  string,
  { categoriaId: string | null; categoriaNome: string }
>;

function montarLookupProdutos(rows: ProdutoCatRow[] | null): LookupProdutoCategoria {
  const map = new Map<string, { categoriaId: string | null; categoriaNome: string }>();
  for (const r of rows ?? []) {
    if (r.categoria) {
      map.set(r.id, { categoriaId: r.categoria.id, categoriaNome: r.categoria.nome });
    } else if (r.categoria_id) {
      map.set(r.id, { categoriaId: r.categoria_id, categoriaNome: "Categoria indisponível" });
    } else {
      map.set(r.id, { categoriaId: null, categoriaNome: "Sem categoria" });
    }
  }
  return map;
}

function bucketCategoria(
  p: Pedido,
  lookup: LookupProdutoCategoria
): { id: string; nome: string } {
  if (!p.produto_id) {
    return { id: "__sem_produto__", nome: "Sem produto vinculado" };
  }
  const info = lookup.get(p.produto_id);
  if (!info) {
    return { id: "__produto_desconhecido__", nome: "Produto não encontrado" };
  }
  if (!info.categoriaId) {
    return { id: "__sem_categoria__", nome: "Sem categoria" };
  }
  return { id: info.categoriaId, nome: info.categoriaNome };
}

function montarRelatorio(
  pedidos: Pedido[],
  lookupProduto: LookupProdutoCategoria,
  inicioIso: string,
  fimIso: string
): RelatorioResposta {
  const totalPedidos = pedidos.length;
  const receitaTotal = pedidos.reduce((acc, p) => acc + Number(p.valor_total), 0);
  const unidadesVendidas = pedidos.reduce((acc, p) => acc + Number(p.quantidade), 0);
  const pedidosEntregues = pedidos.filter((p) => p.status === "entregue").length;
  const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;

  const statusCount = new Map<PedidoStatus, number>();
  for (const p of pedidos) {
    statusCount.set(p.status, (statusCount.get(p.status) ?? 0) + 1);
  }
  const porStatus: RelatorioPorStatus[] = (
    ["pendente", "separacao", "enviado", "entregue"] as const
  ).map((status) => ({
    status,
    label: STATUS_LABEL[status],
    quantidade: statusCount.get(status) ?? 0,
  }));

  const porDia = new Map<string, { receita: number; pedidos: number }>();
  for (const p of pedidos) {
    const chave = format(parseISO(p.created_at), "yyyy-MM-dd");
    const atual = porDia.get(chave) ?? { receita: 0, pedidos: 0 };
    atual.receita += Number(p.valor_total);
    atual.pedidos += 1;
    porDia.set(chave, atual);
  }
  const serieTemporal: RelatorioSeriePonto[] = Array.from(porDia.entries())
    .map(([data, v]) => ({
      data,
      receita: Math.round(v.receita * 100) / 100,
      pedidos: v.pedidos,
    }))
    .sort((a, b) => a.data.localeCompare(b.data));

  const porItem = new Map<string, { quantidade: number; receita: number }>();
  for (const p of pedidos) {
    const nome = p.item?.trim() || "(sem nome)";
    const atual = porItem.get(nome) ?? { quantidade: 0, receita: 0 };
    atual.quantidade += Number(p.quantidade);
    atual.receita += Number(p.valor_total);
    porItem.set(nome, atual);
  }
  const topItens: RelatorioTopItem[] = Array.from(porItem.entries())
    .map(([item, v]) => ({
      item,
      quantidade: v.quantidade,
      receita: Math.round(v.receita * 100) / 100,
    }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 8);

  const porCatAgg = new Map<string, RelatorioPorCategoria>();
  for (const p of pedidos) {
    const { id: bid, nome: blabel } = bucketCategoria(p, lookupProduto);
    const atual = porCatAgg.get(bid) ?? {
      id: bid,
      nome: blabel,
      receita: 0,
      pedidos: 0,
      unidades: 0,
    };
    atual.receita += Number(p.valor_total);
    atual.pedidos += 1;
    atual.unidades += Number(p.quantidade);
    atual.nome = blabel;
    porCatAgg.set(bid, atual);
  }
  const porCategoria: RelatorioPorCategoria[] = Array.from(porCatAgg.values())
    .map((r) => ({
      ...r,
      receita: Math.round(r.receita * 100) / 100,
    }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 12);

  return {
    periodo: { inicio: inicioIso, fim: fimIso },
    resumo: {
      totalPedidos,
      receitaTotal: Math.round(receitaTotal * 100) / 100,
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      pedidosEntregues,
      unidadesVendidas,
    },
    porStatus,
    serieTemporal,
    topItens,
    porCategoria,
  };
}

export async function GET(request: Request) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    if (usuario.role !== "admin") {
      return NextResponse.json(
        { erro: "Apenas administradores podem ver relatorios." },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const inicio = url.searchParams.get("inicio");
    const fim = url.searchParams.get("fim");
    if (!inicio || !fim) {
      return NextResponse.json(
        { erro: "Informe inicio e fim (ISO 8601)." },
        { status: 400 }
      );
    }

    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    if (Number.isNaN(inicioDate.getTime()) || Number.isNaN(fimDate.getTime())) {
      return NextResponse.json({ erro: "Datas invalidas." }, { status: 400 });
    }
    if (inicioDate > fimDate) {
      return NextResponse.json(
        { erro: "Data inicial nao pode ser maior que a final." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .gte("created_at", inicio)
      .lte("created_at", fim)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    const pedidos = (data as Pedido[]) ?? [];
    const idsProduto = [
      ...new Set(pedidos.map((p) => p.produto_id).filter((id): id is string => Boolean(id))),
    ];

    let lookup: LookupProdutoCategoria = new Map();
    if (idsProduto.length > 0) {
      const { data: prows, error: e2 } = await supabase
        .from("produtos")
        .select("id, categoria_id, categoria:categorias(id, nome)")
        .in("id", idsProduto);

      if (e2) {
        return NextResponse.json({ erro: e2.message }, { status: 500 });
      }
      lookup = montarLookupProdutos(prows as ProdutoCatRow[] | null);
    }

    const relatorio = montarRelatorio(pedidos, lookup, inicio, fim);
    return NextResponse.json(relatorio);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao gerar relatorio.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
