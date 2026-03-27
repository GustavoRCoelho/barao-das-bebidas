import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import type { CriarProdutoInput } from "@/lib/produtos";
import { createSupabaseApiClient } from "@/lib/supabase";

export async function GET() {
  const usuario = await obterUsuarioSessao();
  if (!usuario) {
    return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
  }

  const supabase = createSupabaseApiClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const usuario = await obterUsuarioSessao();
  if (!usuario) {
    return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
  }
  if (usuario.role !== "admin") {
    return NextResponse.json({ erro: "Apenas admin pode cadastrar produtos." }, { status: 403 });
  }

  const body = (await request.json()) as Partial<CriarProdutoInput>;
  if (!body.nome?.trim()) {
    return NextResponse.json({ erro: "Nome do produto e obrigatorio." }, { status: 400 });
  }
  if (body.quantidade_estoque === undefined || Number(body.quantidade_estoque) < 0) {
    return NextResponse.json({ erro: "Quantidade em estoque invalida." }, { status: 400 });
  }
  if (body.preco === undefined || Number(body.preco) < 0) {
    return NextResponse.json({ erro: "Preco do produto invalido." }, { status: 400 });
  }

  const supabase = createSupabaseApiClient();
  const { data, error } = await supabase
    .from("produtos")
    .insert({
      nome: body.nome.trim(),
      descricao: body.descricao?.trim() || null,
      preco: Number(body.preco),
      quantidade_estoque: Number(body.quantidade_estoque),
      foto_url: body.foto_url?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
