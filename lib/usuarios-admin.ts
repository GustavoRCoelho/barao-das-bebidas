export type UsuarioAdmin = {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "cliente";
};

export type ListaUsuariosPaginadaResposta = {
  usuarios: UsuarioAdmin[];
  total: number;
  page: number;
  pageSize: number;
};
