import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, KeyRound, HandCoins } from "lucide-react";

import heroFamilia from "@/assets/hero-familia.jpg";
import { LeadForm } from "@/components/LeadForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minha Casa Minha Vida | Felipe Alves Corretagem — Realize o sonho da casa própria" },
      {
        name: "description",
        content:
          "Faixa 1 do Minha Casa Minha Vida: envie seus documentos e agilize sua aprovação com Felipe Alves Corretagem. Atendimento gratuito e sem burocracia.",
      },
      { property: "og:title", content: "Minha Casa Minha Vida | Felipe Alves Corretagem" },
      {
        property: "og:description",
        content: "Envie seus documentos e dê o primeiro passo rumo à casa própria. Rápido, gratuito e sem burocracia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const BENEFICIOS = [
  { icon: HandCoins, texto: "Parcelas que cabem no seu bolso" },
  { icon: KeyRound, texto: "Use o FGTS na entrada" },
  { icon: Clock, texto: "Aprovação rápida e sem burocracia" },
  { icon: CheckCircle2, texto: "Atendimento 100% gratuito" },
];

function Index() {
  return (
    <main className="min-h-screen" style={{ background: "var(--gradient-warm)" }}>
      {/* Cabeçalho da marca */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <KeyRound className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="text-base font-extrabold tracking-tight text-foreground">Felipe Alves Corretagem</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              TRANSFORMO IMÓVEIS EM LARES
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 pb-16 lg:grid-cols-2 lg:gap-14 lg:pt-6">
        {/* Copy persuasiva */}
        <section className="lg:sticky lg:top-8">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Programa Minha Casa Minha Vida{" "}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Sair do aluguel é possível.{" "}
            <span className="text-primary">A sua casa própria começa hoje.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Milhares de famílias já conquistaram o sonho da casa própria pagando parcelas
            <strong className="text-foreground"> menores que um aluguel</strong>. Você pode ser a próxima —
            mas as vagas com as melhores condições são limitadas. Reúna seus documentos e
            <strong className="text-foreground"> garanta a sua análise agora</strong>.
          </p>

          <div className="mt-7 overflow-hidden rounded-2xl" style={{ boxShadow: "var(--shadow-soft)" }}>
            <img
              src={heroFamilia}
              alt="Família feliz em frente à sua nova casa segurando as chaves"
              width={1600}
              height={1100}
              className="h-56 w-full object-cover sm:h-72"
            />
          </div>

          <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BENEFICIOS.map((b) => (
              <li key={b.texto} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <b.icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-medium text-foreground">{b.texto}</span>
              </li>
            ))}
          </ul>

          <p className="mt-7 border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
            “A entrega completa dos documentos é o que garante uma análise rápida e sem imprevistos.
            Estamos aqui para te ajudar em cada etapa.”
          </p>
        </section>

        {/* Formulário de captura */}
        <section id="cadastro">
          <LeadForm />
        </section>
      </div>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}&nbsp;Felipe Alves — Tornando seu sonho possível. Seus dados estão seguros conosco.
          <Link to="/auth" className="ml-2 underline-offset-2 hover:underline">
            Acesso da equipe
          </Link>
        </div>
      </footer>
    </main>
  );
}
