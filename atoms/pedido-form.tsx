"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Produto } from "@/lib/produtos";
import type { PedidoItemSelecionado } from "@/lib/pedidos";
import { PlusCircle, Search } from "lucide-react";
import { FormGroup } from "@/atoms/form-group";
import { useEffect, useMemo, useState } from "react";

export type PedidoFormState = {
  cliente: string;
  telefone: string;
  endereco: string;
  item: string;
  produto_id: string;
  quantidade: string;
  valor_total: string;
  observacao: string;
};

type PedidoFormProps = {
  form: PedidoFormState;
  produtos: Produto[];
  salvando: boolean;
  onChange: (field: keyof PedidoFormState, value: string) => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    itensSelecionados: PedidoItemSelecionado[]
  ) => void;
};

export function PedidoForm({ form, produtos, salvando, onChange, onSubmit }: PedidoFormProps) {
  const [buscaProduto, setBuscaProduto] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [itensSelecionados, setItensSelecionados] = useState<
    Record<string, { produto: Produto; quantidade: number }>
  >({});

  const produtosFiltrados = useMemo(() => {
    const termo = buscaProduto.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter((produto) => produto.nome.toLowerCase().includes(termo));
  }, [buscaProduto, produtos]);

  const itensSelecionadosArray = useMemo(
    () => Object.values(itensSelecionados),
    [itensSelecionados]
  );

  const quantidadeTotalSelecionada = useMemo(
    () => itensSelecionadosArray.reduce((acc, item) => acc + item.quantidade, 0),
    [itensSelecionadosArray]
  );

  const valorTotalCalculado = useMemo(
    () =>
      itensSelecionadosArray.reduce(
        (acc, item) => acc + Number(item.produto.preco || 0) * item.quantidade,
        0
      ),
    [itensSelecionadosArray]
  );

  useEffect(() => {
    onChange("valor_total", valorTotalCalculado.toFixed(2));
  }, [onChange, valorTotalCalculado]);

  function alternarProduto(produto: Produto) {
    setItensSelecionados((atual) => {
      const proximo = { ...atual };
      if (proximo[produto.id]) {
        delete proximo[produto.id];
      } else {
        proximo[produto.id] = { produto, quantidade: 1 };
      }
      return proximo;
    });
  }

  function atualizarQuantidade(produtoId: string, quantidade: string) {
    const valor = Number(quantidade);
    const valorFinal = Number.isNaN(valor) ? 1 : Math.max(1, Math.floor(valor));

    setItensSelecionados((atual) => {
      const item = atual[produtoId];
      if (!item) return atual;
      return {
        ...atual,
        [produtoId]: {
          ...item,
          quantidade: valorFinal,
        },
      };
    });
  }

  function removerSelecionado(produtoId: string) {
    setItensSelecionados((atual) => {
      const proximo = { ...atual };
      delete proximo[produtoId];
      return proximo;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const payloadItens: PedidoItemSelecionado[] = itensSelecionadosArray.map((item) => ({
      produto_id: item.produto.id,
      nome: item.produto.nome,
      quantidade: item.quantidade,
    }));

    onSubmit(event, payloadItens);
  }

  return (
    <Card className="app-panel overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <PlusCircle className="text-primary size-5" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Informações do Pedido</CardTitle>
            <CardDescription>Preencha os dados para gerar a nova entrega.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form className="grid grid-cols-1 gap-6 md:grid-cols-3" onSubmit={handleSubmit}>
          <FormGroup label="Cliente *" id="cliente">
            <Input
              id="cliente"
              value={form.cliente}
              onChange={(event) => onChange("cliente", event.target.value)}
              placeholder="Nome completo"
              className="app-input h-11 px-4 text-[14px] py-2"
              required
            />
          </FormGroup>
          <FormGroup label="Telefone *" id="telefone">
            <Input
              id="telefone"
              type="tel"
              value={form.telefone}
              onChange={(event) => onChange("telefone", event.target.value)}
              placeholder="(00) 00000-0000"
              className="app-input h-11 px-4 text-[14px] py-2"
              required
            />
          </FormGroup>
          <FormGroup label="Endereço de Entrega *" id="endereco">
            <Input
              id="endereco"
              value={form.endereco}
              onChange={(event) => onChange("endereco", event.target.value)}
              placeholder="Rua, número, bairro e cidade"
              className="app-input h-11 px-4 text-[14px] py-2"
              required
            />
          </FormGroup>

          <div className="md:col-span-3">
          <FormGroup label="Itens do pedido *" id="itens_pedido">
              <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {itensSelecionadosArray.length === 0
                    ? "Nenhum item selecionado. Selecione pelo menos um item."
                      : `${itensSelecionadosArray.length} item(ns) selecionado(s), ${quantidadeTotalSelecionada} unidade(s)`}
                  </p>
                  <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">
                        Abrir cardápio
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Selecionar itens do cardápio</DialogTitle>
                        <DialogDescription>
                          Filtre, marque os produtos e defina a quantidade de cada um.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                          className="pl-9"
                          placeholder="Pesquisar por nome..."
                          value={buscaProduto}
                          onChange={(event) => setBuscaProduto(event.target.value)}
                        />
                      </div>

                      <div className="grid max-h-[56vh] grid-cols-1 gap-3 overflow-auto pr-1 md:grid-cols-2">
                        {produtosFiltrados.map((produto) => {
                          const selecionado = itensSelecionados[produto.id];
                          return (
                            <div
                              key={produto.id}
                              className="space-y-3 rounded-lg border border-border p-4"
                            >
                              <button
                                type="button"
                                onClick={() => alternarProduto(produto)}
                                className="flex w-full items-start justify-between gap-3 text-left"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="h-14 w-14 overflow-hidden rounded-md border bg-muted/40">
                                    {produto.foto_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={produto.foto_url}
                                        alt={produto.nome}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                        Sem foto
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{produto.nome}</p>
                                    {produto.descricao ? (
                                      <p className="line-clamp-2 text-xs text-muted-foreground">
                                        {produto.descricao}
                                      </p>
                                    ) : null}
                                    <p className="text-xs font-semibold text-primary">
                                      R$ {Number(produto.preco).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={selecionado ? "default" : "secondary"}>
                                  {selecionado ? "Selecionado" : "Selecionar"}
                                </Badge>
                              </button>

                              {selecionado ? (
                                <FormGroup label="Quantidade" id={`quantidade_${produto.id}`}>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={produto.quantidade_estoque}
                                    value={selecionado.quantidade}
                                    onChange={(event) =>
                                      atualizarQuantidade(produto.id, event.target.value)
                                    }
                                    className="app-input"
                                  />
                                </FormGroup>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {itensSelecionadosArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {itensSelecionadosArray.map((item) => (
                      <button
                        type="button"
                        key={item.produto.id}
                        onClick={() => removerSelecionado(item.produto.id)}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-muted"
                      >
                        {item.produto.nome} x{item.quantidade} -{" "}
                        <span className="text-destructive">remover</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </FormGroup>
          </div>
          <div className="md:col-span-3">
            <FormGroup label="Valor Total (calculado)" id="valor_total">
              <Input
                type="number"
                step="0.01"
                id="valor_total"
                value={form.valor_total}
                readOnly
                className="app-input h-11 px-4 bg-primary/10 border-primary/30 text-primary font-semibold text-right text-[14px]"
              />
            </FormGroup>
          </div>
          <div className="md:col-span-3">
            <FormGroup label="Observações Adicionais" id="observacao">
              <Textarea
                id="observacao"
                value={form.observacao}
                onChange={(event) => onChange("observacao", event.target.value)}
                className="app-input px-4 text-[14px] min-h-[120px]"
              />
            </FormGroup>
          </div>
          <Button
            type="submit"
            className="mx-auto block h-12 w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/90 md:col-span-3"
            disabled={salvando}
          >
            {salvando ? "Processando..." : "Confirmar e Registrar Pedido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
