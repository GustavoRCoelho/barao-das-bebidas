import { NextResponse } from "next/server";
import { obterUsuarioSessao } from "@/lib/auth";
import {
  agregarResumoPedidos,
  padraoBuscaPedidos,
  parsePaginacaoPedidos,
} from "@/lib/pedidos-listagem";
import { createSupabaseApiClient } from "@/lib/supabase";
import type { CriarPedidoInput } from "@/lib/pedidos";

function validarPayload(payload: Partial<CriarPedidoInput>) {
  if (!payload.cliente?.trim()) return "Cliente e obrigatorio.";
  if (!payload.telefone?.trim()) return "Telefone e obrigatorio.";
  if (!payload.endereco?.trim()) return "Endereco e obrigatorio.";
  const temItens = Array.isArray(payload.itens) && payload.itens.length > 0;
  if (!temItens && !payload.item?.trim()) return "Item e obrigatorio.";
  if (!payload.quantidade || payload.quantidade <= 0) {
    return "Quantidade deve ser maior que zero.";
  }
  return null;
}

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const { page, pageSize, q } = parsePaginacaoPedidos(url);
    const pattern = padraoBuscaPedidos(q);

    const supabase = createSupabaseApiClient();

    let listQuery = supabase.from("pedidos").select("*", { count: "exact" });
    let metaQuery = supabase.from("pedidos").select("valor_total, status");

    if (pattern) {
      const clause = `cliente.ilike.${pattern},item.ilike.${pattern},descricao.ilike.${pattern}`;
      listQuery = listQuery.or(clause);
      metaQuery = metaQuery.or(clause);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [listRes, metaRes] = await Promise.all([
      listQuery.order("created_at", { ascending: false }).range(from, to),
      metaQuery,
    ]);

    if (listRes.error) {
      return NextResponse.json({ erro: listRes.error.message }, { status: 500 });
    }
    if (metaRes.error) {
      return NextResponse.json({ erro: metaRes.error.message }, { status: 500 });
    }

    const resumo = agregarResumoPedidos(metaRes.data ?? []);

    return NextResponse.json({
      pedidos: listRes.data ?? [],
      total: listRes.count ?? 0,
      page,
      pageSize,
      resumo,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao listar pedidos.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const usuario = await obterUsuarioSessao();
    if (!usuario) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }

    const body = (await request.json()) as Partial<CriarPedidoInput>;
    const erroValidacao = validarPayload(body);

    if (erroValidacao) {
      return NextResponse.json({ erro: erroValidacao }, { status: 400 });
    }

    const supabase = createSupabaseApiClient();
    const payloadBase: CriarPedidoInput = {
      cliente: body.cliente!.trim(),
      item: body.item?.trim() || "",
      produto_id: body.produto_id,
      descricao: body.descricao?.trim() || undefined,
      itens: body.itens,
      quantidade: Number(body.quantidade),
      valor_total: 0,
      telefone: body.telefone?.trim() || undefined,
      endereco: body.endereco?.trim() || undefined,
      observacao: body.observacao?.trim() || undefined,
      status: body.status ?? "pendente",
    };

    let valorTotalCalculado = 0;
    let quantidadeTotal = 0;

    if (payloadBase.itens && payloadBase.itens.length > 0) {
      for (const item of payloadBase.itens) {
        const { data: produtoAtual, error: produtoError } = await supabase
          .from("produtos")
          .select("id, quantidade_estoque, preco")
          .eq("id", item.produto_id)
          .single();

        if (produtoError || !produtoAtual) {
          return NextResponse.json(
            { erro: `Produto ${item.nome} nao encontrado.` },
            { status: 400 }
          );
        }

        const quantidadeItem = Number(item.quantidade);
        if (!quantidadeItem || quantidadeItem <= 0) {
          return NextResponse.json(
            { erro: `Quantidade invalida para ${item.nome}.` },
            { status: 400 }
          );
        }

        if (produtoAtual.quantidade_estoque < quantidadeItem) {
          return NextResponse.json(
            { erro: `Estoque insuficiente para ${item.nome}.` },
            { status: 400 }
          );
        }

        valorTotalCalculado += Number(produtoAtual.preco) * quantidadeItem;
        quantidadeTotal += quantidadeItem;

        const { error: estoqueError } = await supabase
          .from("produtos")
          .update({ quantidade_estoque: produtoAtual.quantidade_estoque - quantidadeItem })
          .eq("id", item.produto_id);

        if (estoqueError) {
          return NextResponse.json({ erro: estoqueError.message }, { status: 500 });
        }
      }
    } else if (payloadBase.produto_id) {
      const { data: produtoAtual, error: produtoError } = await supabase
        .from("produtos")
        .select("id, quantidade_estoque, preco, nome")
        .eq("id", payloadBase.produto_id)
        .single();

      if (produtoError || !produtoAtual) {
        return NextResponse.json({ erro: "Produto selecionado nao encontrado." }, { status: 400 });
      }

      if (produtoAtual.quantidade_estoque < payloadBase.quantidade) {
        return NextResponse.json({ erro: "Estoque insuficiente para este produto." }, { status: 400 });
      }

      valorTotalCalculado = Number(produtoAtual.preco) * payloadBase.quantidade;
      quantidadeTotal = payloadBase.quantidade;

      const { error: estoqueError } = await supabase
        .from("produtos")
        .update({ quantidade_estoque: produtoAtual.quantidade_estoque - payloadBase.quantidade })
        .eq("id", payloadBase.produto_id);

      if (estoqueError) {
        return NextResponse.json({ erro: estoqueError.message }, { status: 500 });
      }
    }

    const payload: CriarPedidoInput = {
      ...payloadBase,
      quantidade: quantidadeTotal || payloadBase.quantidade,
      valor_total: Number(valorTotalCalculado.toFixed(2)),
    };

    const { itens: _itens, ...payloadSemItens } = payload;

    const { data, error } = await supabase
      .from("pedidos")
      .insert({ ...payloadSemItens, usuario_id: usuario.id })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado ao cadastrar pedido.";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
