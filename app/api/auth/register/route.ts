import { NextResponse } from "next/server";
import {
  contarUsuarios,
  criarSessao,
  encontrarUsuarioPorEmail,
  gerarHashSenha,
} from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { nome, email, senha } = (await request.json()) as {
      nome?: string;
      email?: string;
      senha?: string;
    };

    const nomeNormalizado = nome?.trim() ?? "";
    const emailNormalizado = email?.trim().toLowerCase() ?? "";
    const senhaNormalizada = senha ?? "";

    if (!nomeNormalizado || !emailNormalizado || !senhaNormalizada) {
      return NextResponse.json(
        { erro: "Nome, email e senha sao obrigatorios." },
        { status: 400 }
      );
    }

    if (senhaNormalizada.length < 6) {
      return NextResponse.json(
        { erro: "A senha deve ter no minimo 6 caracteres." },
        { status: 400 }
      );
    }

    const existente = await encontrarUsuarioPorEmail(emailNormalizado);
    if (existente) {
      return NextResponse.json({ erro: "Este email ja esta cadastrado." }, { status: 409 });
    }

    const senhaHash = await gerarHashSenha(senhaNormalizada);
    const totalUsuarios = await contarUsuarios();
    const role = totalUsuarios === 0 ? "admin" : "cliente";
    const supabase = createSupabaseApiClient();
    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        nome: nomeNormalizado,
        email: emailNormalizado,
        role,
        senha_hash: senhaHash,
      })
      .select("id, nome, email, role")
      .single();

    if (error || !data) {
      console.error("Erro Supabase ao cadastrar usuario:", error);
      return NextResponse.json(
        {
          erro:
            error?.message ??
            "Nao foi possivel cadastrar usuario. Verifique tabela/politicas do Supabase.",
        },
        { status: 500 }
      );
    }

    try {
      await criarSessao(data.id);
    } catch (sessionError) {
      console.error("Erro ao criar sessao no cadastro:", sessionError);
      return NextResponse.json(
        {
          erro:
            sessionError instanceof Error
              ? sessionError.message
              : "Usuario criado, mas falhou ao iniciar sessao.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erro inesperado no register:", error);
    const message =
      error instanceof Error ? error.message : "Erro inesperado no cadastro.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
