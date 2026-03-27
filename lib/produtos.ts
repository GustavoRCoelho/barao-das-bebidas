export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  quantidade_estoque: number;
  foto_url: string | null;
  created_at: string;
};

export type CriarProdutoInput = {
  nome: string;
  descricao?: string;
  preco: number;
  quantidade_estoque: number;
  foto_url?: string;
};
