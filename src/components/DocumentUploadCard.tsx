import { useRef } from "react";
import { Camera, Check, X } from "lucide-react";
import type { CategoriaDocumento } from "@/lib/documentos";
import { cn } from "@/lib/utils";

interface DocumentUploadCardProps {
  categoria: CategoriaDocumento;
  arquivos: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function DocumentUploadCard({
  categoria,
  arquivos,
  onAdd,
  onRemove,
}: DocumentUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = categoria.icon;
  const preenchido = arquivos.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 transition-colors",
        preenchido ? "border-primary/50" : "border-border",
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
            preenchido
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground",
          )}
        >
          {preenchido ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight text-foreground">
            {categoria.titulo}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{categoria.descricao}</p>
        </div>
      </div>

      {arquivos.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {arquivos.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md bg-muted px-2.5 py-1.5"
            >
              <span className="truncate text-xs text-foreground">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-muted-foreground transition-colors hover:text-destructive"
                aria-label={`Remover ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-secondary/50 px-3 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-secondary"
      >
        <Camera className="h-4 w-4" />
        {preenchido ? "Adicionar mais fotos" : "Anexar foto"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onAdd(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
