import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";

export async function GET() {
  const usuario = await obterUsuarioSessao();
  if (!usuario) {
    return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
  }

  return NextResponse.json(usuario);
}
