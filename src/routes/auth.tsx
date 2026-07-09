import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Acesso administrativo | Felipe Alves Corretagem" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (modo === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setModo("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erro ao autenticar.";
      toast.error(
        msg.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : msg.includes("already registered")
            ? "Este e-mail já possui conta. Faça login."
            : msg,
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{ background: "var(--gradient-warm)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-foreground">Área administrativa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesso restrito à equipe Felipe Alves Corretagem.
          </p>
        </div>

        <form onSubmit={submeter} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <Label htmlFor="senha" className="text-sm font-medium">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete={modo === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1.5"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" size="lg" disabled={carregando} className="w-full font-semibold">
            {carregando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <KeyRound className="mr-1 h-4 w-4" />
                {modo === "login" ? "Entrar" : "Criar conta"}
              </>
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setModo((m) => (m === "login" ? "signup" : "login"))}
          className="mt-5 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {modo === "login"
            ? "Primeiro acesso? Criar conta"
            : "Já tem conta? Fazer login"}
        </button>
      </div>
    </main>
  );
}
