import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import type { ProdutoDbRow } from "@/lib/produtos";
import { produtoFromDbRow } from "@/lib/produtos";
import { createSupabaseApiClient } from "@/lib/supabase";

const PRODUTO_SELECT = "*, categoria:categorias(id, nome)";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const usuario = await obterUsuarioSessao();
  if (!usuario) {
    return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
  }
  if (usuario.role !== "admin") {
    return NextResponse.json({ erro: "Apenas admin pode editar produtos." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    nome?: string;
    descricao?: string | null;
    preco?: number;
    quantidade_estoque?: number;
    foto_url?: string | null;
    categoria_id?: string | null;
  };

  if (body.preco !== undefined && Number(body.preco) < 0) {
    return NextResponse.json({ erro: "Preco do produto invalido." }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    ...(body.nome !== undefined ? { nome: body.nome.trim() } : {}),
    ...(body.descricao !== undefined ? { descricao: body.descricao?.trim() || null } : {}),
    ...(body.preco !== undefined ? { preco: Number(body.preco) } : {}),
    ...(body.quantidade_estoque !== undefined
      ? { quantidade_estoque: Number(body.quantidade_estoque) }
      : {}),
    ...(body.foto_url !== undefined ? { foto_url: body.foto_url?.trim() || null } : {}),
  };

  if (body.categoria_id !== undefined) {
    payload.categoria_id =
      body.categoria_id === null || body.categoria_id === ""
        ? null
        : String(body.categoria_id);
  }

  const supabase = createSupabaseApiClient();
  const { data, error } = await supabase
    .from("produtos")
    .update(payload)
    .eq("id", id)
    .select(PRODUTO_SELECT)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { erro: "Produto nao encontrado ou sem permissao para atualizar." },
      { status: 404 }
    );
  }

  return NextResponse.json(produtoFromDbRow(data as ProdutoDbRow));
}

export async function DELETE(_request: Request, { params }: Params) {
  const usuario = await obterUsuarioSessao();
  if (!usuario) {
    return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
  }
  if (usuario.role !== "admin") {
    return NextResponse.json({ erro: "Apenas admin pode excluir produtos." }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createSupabaseApiClient();
  const { error } = await supabase.from("produtos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
