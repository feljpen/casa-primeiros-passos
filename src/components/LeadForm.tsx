import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Loader2, ShieldCheck, PartyPopper } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { CATEGORIAS_DOCUMENTOS } from "@/lib/documentos";
import { DocumentUploadCard } from "@/components/DocumentUploadCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const dadosSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo").max(120),
  telefone: z
    .string()
    .trim()
    .min(10, "Informe um telefone válido com DDD")
    .max(20, "Telefone inválido"),
  email: z.string().trim().email("Informe um e-mail válido").max(180),
  cidade: z.string().trim().min(2, "Informe sua cidade").max(120),
});

type Dados = z.infer<typeof dadosSchema>;

const CAMPOS: { name: keyof Dados; label: string; placeholder: string; type: string }[] = [
  { name: "nome", label: "Nome completo", placeholder: "Como está no seu documento", type: "text" },
  { name: "telefone", label: "WhatsApp / Telefone", placeholder: "(00) 00000-0000", type: "tel" },
  { name: "email", label: "E-mail", placeholder: "seu@email.com", type: "email" },
  { name: "cidade", label: "Cidade", placeholder: "Onde você quer morar", type: "text" },
];

export function LeadForm() {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [dados, setDados] = useState<Dados>({ nome: "", telefone: "", email: "", cidade: "" });
  const [erros, setErros] = useState<Partial<Record<keyof Dados, string>>>({});
  const [arquivos, setArquivos] = useState<Record<string, File[]>>({});
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [consentimento, setConsentimento] = useState(false);

  const totalArquivos = Object.values(arquivos).reduce((acc, list) => acc + list.length, 0);

  const avancar = () => {
    const result = dadosSchema.safeParse(dados);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Dados, string>> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as keyof Dados] = issue.message;
      }
      setErros(fieldErrors);
      return;
    }
    setErros({});
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const enviar = async () => {
    if (totalArquivos === 0) {
      toast.error("Anexe pelo menos um documento para prosseguir.");
      return;
    }
    setEnviando(true);
    try {
      const submissionId = crypto.randomUUID();
      const documentos: { categoria: string; arquivos: string[] }[] = [];

      for (const categoria of CATEGORIAS_DOCUMENTOS) {
        const lista = arquivos[categoria.id] ?? [];
        if (lista.length === 0) continue;
        const paths: string[] = [];
        for (let i = 0; i < lista.length; i++) {
          const file = lista[i];
          const ext = file.name.split(".").pop() ?? "dat";
          const path = `${submissionId}/${categoria.id}/${i}-${Date.now()}.${ext}`;
          const { error } = await supabase.storage.from("documentos").upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });
          if (error) throw error;
          paths.push(path);
        }
        documentos.push({ categoria: categoria.id, arquivos: paths });
      }

      const { error: insertError } = await supabase.from("leads").insert({
        submission_id: submissionId,
        nome: dados.nome.trim(),
        telefone: dados.telefone.trim(),
        email: dados.email.trim(),
        cidade: dados.cidade.trim(),
        documentos,
      });
      if (insertError) throw insertError;

      setConcluido(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Não conseguimos enviar agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  };

  if (concluido) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 text-center" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PartyPopper className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-foreground">Recebemos seus documentos! 🎉</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Parabéns por dar o primeiro passo rumo à casa própria, {dados.nome.split(" ")[0]}!
          Nossa equipe já vai analisar tudo e entrar em contato pelo WhatsApp para
          acelerar a sua aprovação. Fique de olho no telefone. 📱
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8" style={{ boxShadow: "var(--shadow-soft)" }}>
      {/* progresso */}
      <div className="mb-6 flex items-center gap-3">
        {[1, 2].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                etapa >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {n}
            </div>
            {n === 1 && <div className={`h-1 flex-1 rounded-full ${etapa > 1 ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {etapa === 1 ? (
        <div>
          <h2 className="text-xl font-bold text-foreground">Vamos começar seu cadastro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Leva menos de 1 minuto. Preencha seus dados para garantir seu atendimento.
          </p>

          <div className="mt-6 space-y-4">
            {CAMPOS.map((campo) => (
              <div key={campo.name}>
                <Label htmlFor={campo.name} className="text-sm font-medium text-foreground">
                  {campo.label}
                </Label>
                <Input
                  id={campo.name}
                  type={campo.type}
                  placeholder={campo.placeholder}
                  value={dados[campo.name]}
                  onChange={(e) => setDados((d) => ({ ...d, [campo.name]: e.target.value }))}
                  className="mt-1.5"
                  aria-invalid={!!erros[campo.name]}
                />
                {erros[campo.name] && (
                  <p className="mt-1 text-xs text-destructive">{erros[campo.name]}</p>
                )}
              </div>
            ))}
          </div>

          <Button onClick={avancar} size="lg" className="mt-6 w-full text-base font-semibold">
            Continuar para os documentos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Seus dados são confidenciais e usados só para sua análise.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-foreground">Anexe seus documentos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tire uma foto ou anexe cada documento abaixo. Envie apenas os que fizerem sentido para o seu caso.
            Quanto mais completo, mais rápida a sua aprovação.
          </p>

          <div className="mt-6 space-y-3">
            {CATEGORIAS_DOCUMENTOS.map((categoria) => (
              <DocumentUploadCard
                key={categoria.id}
                categoria={categoria}
                arquivos={arquivos[categoria.id] ?? []}
                onAdd={(files) =>
                  setArquivos((prev) => ({
                    ...prev,
                    [categoria.id]: [...(prev[categoria.id] ?? []), ...files],
                  }))
                }
                onRemove={(index) =>
                  setArquivos((prev) => ({
                    ...prev,
                    [categoria.id]: (prev[categoria.id] ?? []).filter((_, i) => i !== index),
                  }))
                }
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setEtapa(1)}
              disabled={enviando}
              className="sm:w-auto"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            <Button
              onClick={enviar}
              size="lg"
              disabled={enviando}
              className="flex-1 text-base font-semibold"
            >
              {enviando ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>Enviar documentos {totalArquivos > 0 && `(${totalArquivos})`}</>
              )}
            </Button>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Envio seguro e criptografado.
          </p>
        </div>
      )}
    </div>
  );
}
