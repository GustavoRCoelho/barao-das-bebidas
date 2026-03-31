import type { Categoria } from "@/lib/categorias";

export type CategoriaResumo = Pick<Categoria, "id" | "nome">;

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  quantidade_estoque: number;
  foto_url: string | null;
  categoria_id: string | null;
  categoria: CategoriaResumo | null;
  created_at: string;
};

export type CriarProdutoInput = {
  nome: string;
  descricao?: string;
  preco: number;
  quantidade_estoque: number;
  foto_url?: string;
  categoria_id?: string | null;
};

/** Linha retornada pelo Supabase com embed `categoria:categorias(...)` */
export type ProdutoDbRow = Omit<Produto, "categoria"> & {
  categoria: CategoriaResumo | null;
};

export function produtoFromDbRow(row: ProdutoDbRow): Produto {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    preco: Number(row.preco),
    quantidade_estoque: Number(row.quantidade_estoque),
    foto_url: row.foto_url,
    categoria_id: row.categoria_id ?? null,
    categoria: row.categoria ?? null,
    created_at: row.created_at,
  };
}
