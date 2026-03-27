import { NextResponse } from "next/server";
import {
  criarSessao,
  encontrarUsuarioPorEmail,
  validarSenha,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, senha } = (await request.json()) as {
      email?: string;
      senha?: string;
    };

    const emailNormalizado = email?.trim().toLowerCase() ?? "";
    const senhaNormalizada = senha ?? "";

    if (!emailNormalizado || !senhaNormalizada) {
      return NextResponse.json(
        { erro: "Email e senha sao obrigatorios." },
        { status: 400 }
      );
    }

    const usuario = await encontrarUsuarioPorEmail(emailNormalizado);
    if (!usuario) {
      return NextResponse.json({ erro: "Credenciais invalidas." }, { status: 401 });
    }

    const senhaValida = await validarSenha(senhaNormalizada, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json({ erro: "Credenciais invalidas." }, { status: 401 });
    }

    await criarSessao(usuario.id);

    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado no login.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
