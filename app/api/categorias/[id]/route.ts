import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    if (usuario.role !== "admin") {
      return NextResponse.json({ erro: "Apenas admin pode editar categorias." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as { nome?: string };
    const nome = body.nome?.trim();
    if (!nome) {
      return NextResponse.json({ erro: "Nome da categoria e obrigatorio." }, { status: 400 });
    }

    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("categorias")
      .update({ nome })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ erro: "Categoria nao encontrada." }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao atualizar categoria.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    if (usuario.role !== "admin") {
      return NextResponse.json({ erro: "Apenas admin pode excluir categorias." }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createSupabaseApiClient();
    const { error } = await supabase.from("categorias").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao excluir categoria.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
