import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase";

export async function GET() {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }

    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("produto_favoritos")
      .select("produto_id")
      .eq("usuario_id", usuario.id);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    const produto_ids = (data ?? []).map((row: { produto_id: string }) => row.produto_id);
    return NextResponse.json({ produto_ids });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao listar favoritos.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }

    const body = (await request.json()) as { produto_id?: string };
    const produtoId = body.produto_id?.trim();
    if (!produtoId) {
      return NextResponse.json({ erro: "produto_id e obrigatorio." }, { status: 400 });
    }

    const supabase = createSupabaseApiClient();
    const { data: produto, error: eProd } = await supabase
      .from("produtos")
      .select("id")
      .eq("id", produtoId)
      .maybeSingle();

    if (eProd || !produto) {
      return NextResponse.json({ erro: "Produto nao encontrado." }, { status: 404 });
    }

    const { error } = await supabase.from("produto_favoritos").insert({
      usuario_id: usuario.id,
      produto_id: produtoId,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, ja_existia: true });
      }
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao favoritar produto.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }

    const url = new URL(request.url);
    const produtoId = url.searchParams.get("produto_id")?.trim();
    if (!produtoId) {
      return NextResponse.json({ erro: "Informe produto_id na query." }, { status: 400 });
    }

    const supabase = createSupabaseApiClient();
    const { error } = await supabase
      .from("produto_favoritos")
      .delete()
      .eq("usuario_id", usuario.id)
      .eq("produto_id", produtoId);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao remover favorito.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
