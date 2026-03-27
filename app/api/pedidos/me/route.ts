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
      .from("pedidos")
      .select("*")
      .eq("usuario_id", usuario.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao listar meus pedidos.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

