import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface LeadDocumentoGrupo {
  categoria: string;
  arquivos: { path: string; url: string | null }[];
}

export interface LeadAdmin {
  id: string;
  submission_id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  created_at: string;
  documentos: LeadDocumentoGrupo[];
}

/**
 * Lists all captured leads with signed (temporary) download URLs for each
 * attached document. Only accessible to authenticated admins (RLS + role check).
 */
export const listarLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LeadAdmin[]> => {
    const { supabase, userId } = context;

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError) throw roleError;
    if (!isAdmin) throw new Error("Acesso restrito a administradores.");

    const { data: leads, error } = await supabase
      .from("leads")
      .select("id, submission_id, nome, telefone, email, cidade, created_at, documentos")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const resultado: LeadAdmin[] = [];
    for (const lead of leads ?? []) {
      const grupos = Array.isArray(lead.documentos)
        ? (lead.documentos as { categoria: string; arquivos: string[] }[])
        : [];
      const documentos: LeadDocumentoGrupo[] = [];
      for (const grupo of grupos) {
        const arquivos: { path: string; url: string | null }[] = [];
        for (const path of grupo.arquivos ?? []) {
          const { data: signed } = await supabase.storage
            .from("documentos")
            .createSignedUrl(path, 60 * 60); // 1h
          arquivos.push({ path, url: signed?.signedUrl ?? null });
        }
        documentos.push({ categoria: grupo.categoria, arquivos });
      }
      resultado.push({
        id: lead.id,
        submission_id: lead.submission_id,
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
        cidade: lead.cidade,
        created_at: lead.created_at,
        documentos,
      });
    }
    return resultado;
  });

/** Checks whether the current signed-in user is an admin. */
export const verificarAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw error;
    return { isAdmin: Boolean(data) };
  });

/** Deletes a lead (admin only). */
export const excluirLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError) throw roleError;
    if (!isAdmin) throw new Error("Acesso restrito a administradores.");

    const { error } = await supabase.from("leads").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
