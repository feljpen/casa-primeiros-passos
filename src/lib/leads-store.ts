export interface LeadDocumentoGrupo {
  categoria: string;
  arquivos: { nome: string; dataUrl: string }[];
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  documentos: LeadDocumentoGrupo[];
  created_at: string;
}

const STORAGE_KEY = "fac_leads";
const AUTH_KEY = "fac_admin_auth";
const ADMIN_PASSWORD = "admin123";

function read(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

function write(leads: Lead[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function listarLeads(): Lead[] {
  return read().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function salvarLead(
  dados: Omit<Lead, "id" | "created_at">,
): Lead {
  const lead: Lead = {
    ...dados,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  const leads = read();
  leads.push(lead);
  write(leads);
  return lead;
}

export function excluirLead(id: string): void {
  write(read().filter((l) => l.id !== id));
}

export function limparLeads(): void {
  write([]);
}

export function isAutenticado(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "true";
}

export function autenticar(senha: string): boolean {
  if (senha !== ADMIN_PASSWORD) return false;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_KEY, "true");
  }
  return true;
}

export function sair(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_KEY);
  }
}
