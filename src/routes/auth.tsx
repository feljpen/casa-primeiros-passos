import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader as Loader2, Lock } from "lucide-react";

import { autenticar, isAutenticado } from "@/lib/leads-store";
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
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (isAutenticado()) navigate({ to: "/admin", replace: true });
  }, [navigate]);

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (autenticar(senha)) {
        navigate({ to: "/admin", replace: true });
      } else {
        toast.error("Senha incorreta.");
      }
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
            <Label htmlFor="senha" className="text-sm font-medium">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
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
                Entrar
              </>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
