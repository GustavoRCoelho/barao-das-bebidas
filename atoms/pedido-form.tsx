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
import { MapPin, Phone, Plus, PlusCircle, Search, Sparkles, User2, X } from "lucide-react";
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

function formatarTelefoneBR(value: string) {
  const numeros = value.replace(/\D/g, "").slice(0, 11);
  if (numeros.length === 0) return "";
  if (numeros.length <= 2) return `(${numeros}`;
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

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

  const textoResumo =
    itensSelecionadosArray.length === 0
      ? "Nenhum item selecionado ainda. Abra o cardápio e monte um pedido caprichado."
      : `${itensSelecionadosArray.length} item(ns) selecionado(s), ${quantidadeTotalSelecionada} unidade(s)`;

  return (
    <Card className="app-panel overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-lg text-foreground">Monte seu pedido</CardTitle>
              <CardDescription>
                Escolha bebidas, ajuste quantidades e finalize em poucos passos.
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="border border-border bg-background text-muted-foreground">
            Pedido rapido
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <form className="grid grid-cols-1 gap-6 md:grid-cols-6" onSubmit={handleSubmit}>
          <div className="space-y-4 md:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Seus dados para entrega
            </h3>
            <FormGroup label="Nome de quem vai receber *" id="cliente">
              <div className="relative">
                <User2 className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="cliente"
                  value={form.cliente}
                  onChange={(event) => onChange("cliente", event.target.value)}
                  placeholder="Ex.: Ana Souza"
                  className="app-input h-11 py-2 pr-4 pl-10 text-[14px]"
                  required
                />
              </div>
            </FormGroup>
            <FormGroup label="Telefone/WhatsApp *" id="telefone">
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={(event) =>
                    onChange("telefone", formatarTelefoneBR(event.target.value))
                  }
                  placeholder="(00) 00000-0000"
                  pattern="\(\d{2}\) \d{5}-\d{4}"
                  title="Use o formato (99) 99999-9999"
                  maxLength={15}
                  inputMode="numeric"
                  className="app-input h-11 py-2 pr-4 pl-10 text-[14px]"
                  required
                />
              </div>
            </FormGroup>
            <FormGroup label="Endereço de entrega *" id="endereco">
              <div className="relative">
                <MapPin className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="endereco"
                  value={form.endereco}
                  onChange={(event) => onChange("endereco", event.target.value)}
                  placeholder="Rua, número, bairro e cidade"
                  className="app-input h-11 py-2 pr-4 pl-10 text-[14px]"
                  required
                />
              </div>
            </FormGroup>
          </div>

          <div className="space-y-4 md:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              O que vai no pedido
            </h3>
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{textoResumo}</p>
                <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="border-primary/40">
                      <PlusCircle className="size-4" />
                      Escolher no cardápio
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
                            className={`space-y-3 rounded-lg border p-4 transition-colors ${
                              selecionado ? "border-primary/40 bg-primary/5" : "border-border"
                            }`}
                          >
                            <div className="flex w-full items-start justify-between gap-3 text-left">
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
                              <div className="flex items-center gap-2">
                                <Badge variant={selecionado ? "default" : "secondary"}>
                                  {selecionado ? "Selecionado" : "Disponivel"}
                                </Badge>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant={selecionado ? "destructive" : "outline"}
                                  className="h-8 w-8"
                                  onClick={() => alternarProduto(produto)}
                                  aria-label={
                                    selecionado
                                      ? `Remover ${produto.nome} do pedido`
                                      : `Adicionar ${produto.nome} ao pedido`
                                  }
                                >
                                  {selecionado ? <X className="size-4" /> : <Plus className="size-4" />}
                                </Button>
                              </div>
                            </div>

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
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
                  Nenhum item adicionado ainda.
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-6">
            <FormGroup label="Observações do pedido" id="observacao">
              <Textarea
                id="observacao"
                value={form.observacao}
                onChange={(event) => onChange("observacao", event.target.value)}
                className="app-input min-h-[110px] px-4 text-[14px]"
                placeholder="Ex.: retirar gelo, entregar no portao lateral, tocar interfone..."
              />
            </FormGroup>
          </div>

          <div className="md:col-span-6">
            <FormGroup label="Valor total (calculado automaticamente)" id="valor_total">
              <Input
                type="number"
                step="0.01"
                id="valor_total"
                value={form.valor_total}
                readOnly
                className="app-input h-11 border-primary/30 bg-primary/10 px-4 text-right text-[14px] font-semibold text-primary"
              />
            </FormGroup>
          </div>

          <Button
            type="submit"
            className="mx-auto block h-12 w-full max-w-lg rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 md:col-span-6"
            disabled={salvando}
          >
            {salvando ? "Enviando pedido..." : "Finalizar pedido agora"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
