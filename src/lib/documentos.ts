import {
  IdCard,
  Home,
  ScrollText,
  HeartHandshake,
  ReceiptText,
  Landmark,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export interface CategoriaDocumento {
  id: string;
  titulo: string;
  descricao: string;
  icon: LucideIcon;
}

export const CATEGORIAS_DOCUMENTOS: CategoriaDocumento[] = [
  {
    id: "rg-cpf",
    titulo: "RG e CPF (frente e verso)",
    descricao: "Foto da cópia do RG e CPF, frente e verso.",
    icon: IdCard,
  },
  {
    id: "comprovante-residencia",
    titulo: "Comprovante de residência",
    descricao: "Conta de água, luz, gás, telefone ou internet (atualizado).",
    icon: Home,
  },
  {
    id: "certidao-nascimento",
    titulo: "Certidão de nascimento",
    descricao: "Envie se você for solteiro(a).",
    icon: ScrollText,
  },
  {
    id: "certidao-casamento",
    titulo: "Certidão de casamento",
    descricao: "Envie se você for casado(a).",
    icon: HeartHandshake,
  },
  {
    id: "contracheque",
    titulo: "Contracheque",
    descricao: "Se você trabalha de carteira assinada.",
    icon: ReceiptText,
  },
  {
    id: "extrato-fgts",
    titulo: "Extrato do FGTS",
    descricao: "Caso você trabalhe de CLT.",
    icon: Landmark,
  },
  {
    id: "autonomo-renda",
    titulo: "Autônomo — Comprovante de renda",
    descricao: "Extratos bancários ou comprovante de renda com comprovação.",
    icon: Briefcase,
  },
];
