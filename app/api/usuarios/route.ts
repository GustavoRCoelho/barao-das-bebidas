import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase";

export async function GET() {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    if (usuario.role !== "admin") {
      return NextResponse.json({ erro: "Apenas admin pode ver usuarios." }, { status: 403 });
    }

    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, role")
      .order("nome", { ascending: true });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao listar usuarios.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

