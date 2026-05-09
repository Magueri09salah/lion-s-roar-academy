import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { PROGRAM } from "@/lib/data";

export const Route = createFileRoute("/programme")({
  head: () => ({
    meta: [
      { title: "Programme & Calendrier — Lions Academy" },
      { name: "description", content: "Découvrez le programme mois par mois de la formation Lions Academy : objectifs, ateliers et rendus." },
      { property: "og:title", content: "Programme & Calendrier — Lions Academy" },
      { property: "og:description", content: "6 mois structurés pour apprendre l'architecture d'intérieur." },
    ],
  }),
  component: Programme,
});

function Programme() {
  return (
    <>
      <PageHero eyebrow="Programme · 6 mois" title="Un calendrier clair, mois après mois." intro="Chaque mois apporte un bloc thématique avec un rendu corrigé. Le tout converge vers le Projet de Fin de Formation." />
      <Section>
        <ol className="relative border-l-2 border-border space-y-10 pl-6 sm:pl-10">
          {PROGRAM.map((m, i) => (
            <li key={m.month} className="relative">
              <span className="absolute -left-[34px] sm:-left-[50px] top-1 grid place-items-center w-9 h-9 rounded-full text-xs font-medium" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
                {i + 1}
              </span>
              <div className="card-elegant">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl">{m.title}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{m.month}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{m.objective}</p>
                <div className="mt-5 grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Axe principal</div>
                    <div className="mt-1">{m.axis}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contenu</div>
                    <ul className="mt-1 text-muted-foreground space-y-0.5">
                      {m.items.map((it) => <li key={it}>· {it}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rendu</div>
                    <div className="mt-1 inline-block px-3 py-1 rounded-full text-xs" style={{ background: "color-mix(in oklab, var(--gold) 25%, transparent)" }}>{m.deliverable}</div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <Section eyebrow="Certification" title="Conditions d'obtention du certificat" className="bg-secondary/40">
        <div className="max-w-3xl">
          <p className="text-muted-foreground leading-relaxed text-base">
            Pour obtenir le certificat Lions Academy, l'apprenant doit valider les rendus mensuels ainsi que le Projet de Fin de Formation. Le certificat n'est pas délivré automatiquement par simple présence aux cours.
          </p>
          <Link to="/inscription" className="btn-gold mt-8">Je souhaite m'inscrire</Link>
        </div>
      </Section>
    </>
  );
}
