import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import type { CriarCategoriaInput } from "@/lib/categorias";
import { createSupabaseApiClient } from "@/lib/supabase";

export async function GET() {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }

    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao listar categorias.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    if (usuario.role !== "admin") {
      return NextResponse.json({ erro: "Apenas admin pode criar categorias." }, { status: 403 });
    }

    const body = (await request.json()) as Partial<CriarCategoriaInput>;
    const nome = body.nome?.trim();
    if (!nome) {
      return NextResponse.json({ erro: "Nome da categoria e obrigatorio." }, { status: 400 });
    }

    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("categorias")
      .insert({ nome })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao criar categoria.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
