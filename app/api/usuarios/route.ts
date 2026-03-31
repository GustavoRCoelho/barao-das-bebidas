import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import { parsePaginacaoPedidos, padraoBuscaPedidos } from "@/lib/pedidos-listagem";
import { createSupabaseApiClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    if (usuario.role !== "admin") {
      return NextResponse.json({ erro: "Apenas admin pode ver usuarios." }, { status: 403 });
    }

    const url = new URL(request.url);
    const { page, pageSize } = parsePaginacaoPedidos(url);
    const nomeRaw = url.searchParams.get("nome")?.trim() ?? "";
    const emailRaw = url.searchParams.get("email")?.trim() ?? "";

    const nomeP = padraoBuscaPedidos(nomeRaw);
    const emailP = padraoBuscaPedidos(emailRaw);

    const supabase = createSupabaseApiClient();

    let listQuery = supabase.from("usuarios").select("id, nome, email, role", { count: "exact" });

    if (nomeP) {
      listQuery = listQuery.ilike("nome", nomeP);
    }
    if (emailP) {
      listQuery = listQuery.ilike("email", emailP);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await listQuery
      .order("nome", { ascending: true })
      .range(from, to);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({
      usuarios: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao listar usuarios.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

