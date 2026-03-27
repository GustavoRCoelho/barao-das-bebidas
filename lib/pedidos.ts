export type PedidoStatus = "pendente" | "separacao" | "enviado" | "entregue";

export type PedidoItemSelecionado = {
  produto_id: string;
  nome: string;
  quantidade: number;
};

export type Pedido = {
  id: string;
  usuario_id: string | null;
  produto_id: string | null;
  cliente: string;
  telefone: string | null;
  endereco: string | null;
  item: string;
  descricao: string | null;
  quantidade: number;
  valor_total: number;
  status: PedidoStatus;
  observacao: string | null;
  created_at: string;
};

export type CriarPedidoInput = {
  cliente: string;
  telefone?: string;
  endereco?: string;
  item: string;
  produto_id?: string;
  descricao?: string;
  quantidade: number;
  valor_total: number;
  status?: PedidoStatus;
  observacao?: string;
  itens?: PedidoItemSelecionado[];
};
