import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import { createSupabaseApiClient } from "@/lib/supabase";
import type { CriarPedidoInput } from "@/lib/pedidos";

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
      return NextResponse.json(
        { erro: "Apenas administradores podem gerenciar pedidos." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = (await request.json()) as Partial<CriarPedidoInput>;
    const supabase = createSupabaseApiClient();

    const payload = {
      ...(body.cliente !== undefined ? { cliente: body.cliente.trim() } : {}),
      ...(body.produto_id !== undefined ? { produto_id: body.produto_id } : {}),
      ...(body.telefone !== undefined ? { telefone: body.telefone.trim() } : {}),
      ...(body.endereco !== undefined ? { endereco: body.endereco.trim() } : {}),
      ...(body.item !== undefined ? { item: body.item.trim() } : {}),
      ...(body.descricao !== undefined ? { descricao: body.descricao.trim() } : {}),
      ...(body.observacao !== undefined ? { observacao: body.observacao.trim() } : {}),
      ...(body.quantidade !== undefined
        ? { quantidade: Number(body.quantidade) }
        : {}),
      ...(body.valor_total !== undefined
        ? { valor_total: Number(body.valor_total) }
        : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    };

    const { data, error } = await supabase
      .from("pedidos")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao atualizar pedido.";
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
      return NextResponse.json(
        { erro: "Apenas administradores podem gerenciar pedidos." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = createSupabaseApiClient();
    const { error } = await supabase.from("pedidos").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao remover pedido.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
