import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }
    if (usuario.role !== "admin") {
      return NextResponse.json({ erro: "Apenas admin pode alterar permissoes." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as { role?: string };

    if (!body.role || !["admin", "cliente"].includes(body.role)) {
      return NextResponse.json({ erro: "Role invalida." }, { status: 400 });
    }

    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("usuarios")
      .update({ role: body.role })
      .eq("id", id)
      .select("id, nome, email, role")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ erro: "Usuario nao encontrado." }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao atualizar usuario.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

