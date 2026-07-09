import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  LogOut,
  Loader2,
  Download,
  FileText,
  Phone,
  Mail,
  MapPin,
  Users,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

import {
  listarLeads,
  excluirLead as excluirLeadStore,
  sair as sairStore,
  type Lead,
} from "@/lib/leads-store";
import { CATEGORIAS_DOCUMENTOS } from "@/lib/documentos";
import { Button } from "@/components/ui/button";

const TITULOS = Object.fromEntries(
  CATEGORIAS_DOCUMENTOS.map((c) => [c.id, c.titulo]),
) as Record<string, string>;

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escaparCsv(valor: string): string {
  const precisaAspas = /[",;\n\r]/.test(valor);
  const limpo = valor.replace(/"/g, '""');
  return precisaAspas ? `"${limpo}"` : limpo;
}

function exportarCsv(leads: Lead[]) {
  const cabecalho = ["Nome", "Telefone", "E-mail", "Cidade", "Documentos", "Recebido em"];
  const linhas = leads.map((lead) => {
    const totalDocs = lead.documentos.reduce((acc, g) => acc + g.arquivos.length, 0);
    return [
      escaparCsv(lead.nome),
      escaparCsv(lead.telefone),
      escaparCsv(lead.email),
      escaparCsv(lead.cidade),
      String(totalDocs),
      escaparCsv(formatarData(lead.created_at)),
    ].join(";");
  });
  const csv = [cabecalho.join(";"), ...linhas].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function AdminPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    setLeads(listarLeads());
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const excluir = (id: string) => {
    excluirLeadStore(id);
    setLeads(listarLeads());
    toast.success("Lead excluído.");
  };

  const sair = () => {
    sairStore();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">Leads recebidos</p>
              <p className="text-xs text-muted-foreground">Felipe Alves Corretagem</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportarCsv(leads)}
              disabled={leads.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={carregar}>
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={sair}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        {carregando ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum lead recebido ainda. Assim que alguém enviar o formulário, aparece aqui.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {leads.length} {leads.length === 1 ? "lead recebido" : "leads recebidos"}
            </p>
            <div className="space-y-4">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onExcluir={() => excluir(lead.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function LeadCard({ lead, onExcluir }: { lead: Lead; onExcluir: () => void }) {
  const [confirmar, setConfirmar] = useState(false);
  const totalArquivos = lead.documentos.reduce((acc, g) => acc + g.arquivos.length, 0);

  return (
    <div
      className="rounded-2xl border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">{lead.nome}</h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <a href={`tel:${lead.telefone}`} className="flex items-center gap-1.5 hover:text-foreground">
              <Phone className="h-3.5 w-3.5" /> {lead.telefone}
            </a>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-foreground">
              <Mail className="h-3.5 w-3.5" /> {lead.email}
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {lead.cidade}
            </span>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
          {formatarData(lead.created_at)}
        </span>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Documentos ({totalArquivos})
        </p>
        {lead.documentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
        ) : (
          <div className="space-y-3">
            {lead.documentos.map((grupo) => (
              <div key={grupo.categoria}>
                <p className="text-sm font-medium text-foreground">
                  {TITULOS[grupo.categoria] ?? grupo.categoria}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {grupo.arquivos.map((arq, i) => (
                    <a
                      key={`${arq.nome}-${i}`}
                      href={arq.dataUrl}
                      download={arq.nome}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <Download className="h-3.5 w-3.5" /> {arq.nome || `Arquivo ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        {confirmar ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Confirmar exclusão?</span>
            <Button variant="destructive" size="sm" onClick={onExcluir}>
              Sim, excluir
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmar(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmar(true)}
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        )}
      </div>
    </div>
  );
}
