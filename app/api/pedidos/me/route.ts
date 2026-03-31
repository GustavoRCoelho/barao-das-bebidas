import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import {
  agregarResumoPedidos,
  padraoBuscaPedidos,
  parsePaginacaoPedidos,
} from "@/lib/pedidos-listagem";
import { createSupabaseApiClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }

    const url = new URL(request.url);
    const { page, pageSize, q } = parsePaginacaoPedidos(url);
    const pattern = padraoBuscaPedidos(q);

    const supabase = createSupabaseApiClient();

    let listQuery = supabase
      .from("pedidos")
      .select("*", { count: "exact" })
      .eq("usuario_id", usuario.id);

    let metaQuery = supabase
      .from("pedidos")
      .select("valor_total, status")
      .eq("usuario_id", usuario.id);

    if (pattern) {
      const clause = `cliente.ilike.${pattern},item.ilike.${pattern},descricao.ilike.${pattern},observacao.ilike.${pattern}`;
      listQuery = listQuery.or(clause);
      metaQuery = metaQuery.or(clause);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [listRes, metaRes] = await Promise.all([
      listQuery.order("created_at", { ascending: false }).range(from, to),
      metaQuery,
    ]);

    if (listRes.error) {
      return NextResponse.json({ erro: listRes.error.message }, { status: 500 });
    }
    if (metaRes.error) {
      return NextResponse.json({ erro: metaRes.error.message }, { status: 500 });
    }

    const resumo = agregarResumoPedidos(metaRes.data ?? []);

    return NextResponse.json({
      pedidos: listRes.data ?? [],
      total: listRes.count ?? 0,
      page,
      pageSize,
      resumo,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao listar meus pedidos.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

