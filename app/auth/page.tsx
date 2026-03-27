"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false);
  const [mostrarSenhaCadastro, setMostrarSenhaCadastro] = useState(false);

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
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative grid min-h-screen w-full md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden md:block">
          <Image
            src="/barao-das-bebidas-store.webp"
            alt="Loja Barão das Bebidas"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/45 to-black/70 dark:from-black/40 dark:via-black/55 dark:to-black/75" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-center">
            <h1
              className="app-heading-ornate app-heading-ornate-login text-5xl font-black tracking-tight text-yellow-300 md:text-6xl"
              data-ornament-left="f"
              data-ornament-right="g"
            >
              Barão das Bebidas
            </h1>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-yellow-100/85">
              Peça suas bebidas com rapidez, acompanhe cada etapa do pedido e receba tudo no seu balcão sem sair da mesa.
            </p>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-card/80 p-6 sm:p-10 md:p-14">
          <div className="w-full max-w-md space-y-6">
            <div className="flex justify-center">
              <div className="h-28 w-28 overflow-hidden rounded-lg border border-border bg-card p-1">
                <Image
                  src="/logo.png"
                  alt="Logo Barão das Bebidas"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Erro de autenticação</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Tabs defaultValue="login" className="space-y-3">
              <TabsList className="w-full bg-muted text-muted-foreground ring-1 ring-border">
                <TabsTrigger
                  value="login"
                  className="data-active:bg-primary data-active:text-primary-foreground"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="cadastro"
                  className="data-active:bg-primary data-active:text-primary-foreground"
                >
                  Cadastro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4 rounded-2xl border border-border bg-card/70 p-4" onSubmit={login}>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="voce@barao.com"
                        className="h-11 border-border bg-background/80 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/60"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="senha"
                        name="senha"
                        type={mostrarSenhaLogin ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="h-11 border-border bg-background/80 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/60"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaLogin((v) => !v)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={mostrarSenhaLogin ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {mostrarSenhaLogin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="h-11 w-full bg-primary font-semibold tracking-wide text-primary-foreground hover:bg-primary/90"
                    type="submit"
                    disabled={loadingLogin}
                  >
                    {loadingLogin ? "Entrando..." : "Entrar"}
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 text-primary" />
                    Sessão segura e senha criptografada.
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="cadastro">
                <form className="space-y-4 rounded-2xl border border-border bg-card/70 p-4" onSubmit={cadastrar}>
                  <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="nome"
                        name="nome"
                        required
                        placeholder="Seu nome completo"
                        className="h-11 border-border bg-background/80 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/60"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="emailCadastro">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="emailCadastro"
                        name="emailCadastro"
                        type="email"
                        required
                        placeholder="voce@barao.com"
                        className="h-11 border-border bg-background/80 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/60"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="senhaCadastro">Senha</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="senhaCadastro"
                        name="senhaCadastro"
                        type={mostrarSenhaCadastro ? "text" : "password"}
                        minLength={6}
                        required
                        placeholder="Mínimo de 6 caracteres"
                        className="h-11 border-border bg-background/80 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/60"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaCadastro((v) => !v)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={mostrarSenhaCadastro ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {mostrarSenhaCadastro ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="h-11 w-full bg-primary font-semibold tracking-wide text-primary-foreground hover:bg-primary/90"
                    type="submit"
                    disabled={loadingCadastro}
                  >
                    {loadingCadastro ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </main>
  );
}
