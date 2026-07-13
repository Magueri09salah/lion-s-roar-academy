import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CardGridSkeleton, ErrorState } from "@/components/site/States";
import { fetchFormations, fetchProgram } from "@/lib/api";

export const Route = createFileRoute("/programme")({
  // Formations drive the filter buttons (ALL published formations, even
  // those without a programme yet); program supplies the timelines.
  loader: async () => {
    const [program, formations] = await Promise.all([fetchProgram(), fetchFormations()]);
    return { program, formations };
  },
  head: () => ({
    meta: [
      { title: "Programme & Calendrier — Lions Academie" },
      { name: "description", content: "Découvrez le programme mois par mois de chaque formation Lions Academie : objectifs, ateliers et rendus." },
      { property: "og:title", content: "Programme & Calendrier — Lions Academie" },
      { property: "og:description", content: "Un calendrier structuré, formation par formation." },
    ],
  }),
  pendingComponent: () => (
    <Section><CardGridSkeleton count={6} /></Section>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <Section>
        <ErrorState message={error.message} onRetry={() => { router.invalidate(); reset(); }} />
      </Section>
    );
  },
  component: Programme,
});

function Programme() {
  const { program, formations } = Route.useLoaderData();

  const [selected, setSelected] = useState<string | null>(null);
  // Default to the first formation once data is known. `selected` stays null
  // until the visitor clicks — resolve the effective selection at render.
  const activeSlug = selected ?? formations[0]?.slug ?? null;

  const months = useMemo(
    () => program.filter((m) => m.formation?.slug === activeSlug),
    [program, activeSlug],
  );

  return (
    <>
      <PageHero eyebrow="Programme" title="Un calendrier clair, mois après mois." intro="Chaque formation suit son propre programme : des blocs thématiques mensuels avec un rendu corrigé à chaque étape." />
      <Section>
        {formations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {formations.map((f) => (
              <button
                key={f.slug}
                onClick={() => setSelected(f.slug)}
                className={`px-4 py-2 text-sm rounded-full border transition-all ${activeSlug === f.slug ? "bg-ink text-ivory border-ink" : "border-border hover:border-foreground"}`}
              >
                {f.title}
              </button>
            ))}
          </div>
        )}

        {months.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            Le programme de cette formation sera publié prochainement.
          </p>
        ) : (
          <ol className="relative border-l-2 border-border space-y-10 pl-6 sm:pl-10">
            {months.map((m, i) => (
              <li key={m.id ?? m.month} className="relative">
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
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cours théorique</div>
                      <div className="mt-1">{m.axis}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Atelier</div>
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
        )}
      </Section>
      <Section eyebrow="Certification" title="Conditions d'obtention du certificat" className="bg-secondary/40">
        <div className="max-w-3xl">
          <p className="text-muted-foreground leading-relaxed text-base">
            Pour obtenir le certificat Lions Academie, l'apprenant doit valider les rendus mensuels ainsi que le Projet de Fin de Formation. Le certificat n'est pas délivré automatiquement par simple présence aux cours.
          </p>
          <Link to="/inscription" className="btn-gold mt-8">Je souhaite m'inscrire</Link>
        </div>
      </Section>
    </>
  );
}
