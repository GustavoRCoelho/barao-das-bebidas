import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createSupabaseApiClient } from "@/lib/supabase";

const SESSION_COOKIE = "bb_session";
const SESSION_TTL_DAYS = 7;

type UsuarioRow = {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "cliente";
  senha_hash: string;
};

export type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "cliente";
};

function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function pbkdf2(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 120_000, 64, "sha512", (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });
}

export async function gerarHashSenha(senha: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await pbkdf2(senha, salt);
  return `pbkdf2$120000$${salt}$${hash}`;
}

export async function validarSenha(senha: string, senhaHash: string) {
  const [algoritmo, iteracoes, salt, hashAtual] = senhaHash.split("$");
  if (algoritmo !== "pbkdf2" || !iteracoes || !salt || !hashAtual) {
    return false;
  }

  const hashEntrada = await pbkdf2(senha, salt);
  return crypto.timingSafeEqual(
    Buffer.from(hashEntrada, "hex"),
    Buffer.from(hashAtual, "hex")
  );
}

export async function criarSessao(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  const supabase = createSupabaseApiClient();
  const { error } = await supabase.from("auth_sessions").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(
      `Falha ao criar sessao: ${error.message}${error.code ? ` (code: ${error.code})` : ""}`
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function limparSessao() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const supabase = createSupabaseApiClient();
    await supabase.from("auth_sessions").delete().eq("token_hash", hashSessionToken(token));
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function obterUsuarioSessao(): Promise<UsuarioSessao | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const supabase = createSupabaseApiClient();
  const tokenHash = hashSessionToken(token);
  const agora = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("auth_sessions")
    .select("user_id, expires_at")
    .eq("token_hash", tokenHash)
    .gt("expires_at", agora)
    .single();

  if (sessionError || !session) {
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from("usuarios")
    .select("id, nome, email, role")
    .eq("id", session.user_id)
    .single();

  if (userError || !user) {
    return null;
  }

  return user as UsuarioSessao;
}

export async function encontrarUsuarioPorEmail(email: string) {
  const supabase = createSupabaseApiClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, role, senha_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Falha ao buscar usuario: ${error.message}${error.code ? ` (code: ${error.code})` : ""}`
    );
  }

  return data as UsuarioRow | null;
}

export async function contarUsuarios() {
  const supabase = createSupabaseApiClient();
  const { count, error } = await supabase
    .from("usuarios")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(
      `Falha ao contar usuarios: ${error.message}${error.code ? ` (code: ${error.code})` : ""}`
    );
  }

  return count ?? 0;
}
