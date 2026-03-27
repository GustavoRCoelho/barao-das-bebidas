"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Martini, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoadingLogin(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      senha: String(form.get("senha") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { erro?: string };

      if (!response.ok) {
        throw new Error(data.erro ?? "Falha ao entrar.");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao realizar login.";
      setError(message);
    } finally {
      setLoadingLogin(false);
    }
  }

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoadingCadastro(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("emailCadastro") ?? ""),
      senha: String(form.get("senhaCadastro") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { erro?: string };

      if (!response.ok) {
        throw new Error(data.erro ?? "Falha ao cadastrar.");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao realizar cadastro.";
      setError(message);
    } finally {
      setLoadingCadastro(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-slate-950 via-indigo-950 to-slate-900 p-4 text-slate-100">
      <div className="pointer-events-none absolute -top-36 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <Card className="w-full max-w-md border-white/10 bg-white/5 text-slate-100 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Martini className="size-5 text-cyan-300" />
            Barão das Bebidas
          </CardTitle>
          <CardDescription className="text-slate-300">
            Faça login para acessar os pedidos ou crie seu usuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Erro de autenticação</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Tabs defaultValue="login">
            <TabsList className="w-full bg-white/10 text-slate-300 ring-1 ring-white/15">
              <TabsTrigger
                value="login"
                className="data-active:bg-cyan-500 data-active:text-slate-950 dark:data-active:bg-cyan-500 dark:data-active:text-slate-950"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="cadastro"
                className="data-active:bg-violet-500 data-active:text-white dark:data-active:bg-violet-500 dark:data-active:text-white"
              >
                Cadastro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form className="space-y-3" onSubmit={login}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="border-white/20 bg-white/5 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    required
                    className="border-white/20 bg-white/5 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <Button
                  className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  type="submit"
                  disabled={loadingLogin}
                >
                  {loadingLogin ? "Entrando..." : "Entrar"}
                </Button>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="size-4 text-emerald-300" />
                  Sessão segura e senha criptografada.
                </div>
              </form>
            </TabsContent>

            <TabsContent value="cadastro">
              <form className="space-y-3" onSubmit={cadastrar}>
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    required
                    className="border-white/20 bg-white/5 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emailCadastro">Email</Label>
                  <Input
                    id="emailCadastro"
                    name="emailCadastro"
                    type="email"
                    required
                    className="border-white/20 bg-white/5 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="senhaCadastro">Senha</Label>
                  <Input
                    id="senhaCadastro"
                    name="senhaCadastro"
                    type="password"
                    minLength={6}
                    required
                    className="border-white/20 bg-white/5 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <Button
                  className="w-full bg-violet-500 text-white hover:bg-violet-400"
                  type="submit"
                  disabled={loadingCadastro}
                >
                  {loadingCadastro ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
