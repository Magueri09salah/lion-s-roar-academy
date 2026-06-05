import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CardGridSkeleton, ErrorState } from "@/components/site/States";
import { fetchProjects, type Project } from "@/lib/api";
import { PROJECT_CATEGORIES } from "@/lib/data";

export const Route = createFileRoute("/realisations")({
  // Fetch everything once; categories are filtered client-side so toggling
  // a chip doesn't re-hit the API. The backend already supports
  // `?category=` if we want to switch to server-side filtering later.
  loader: () => fetchProjects(),
  head: () => ({
    meta: [
      { title: "Réalisations des élèves — Lions Academy" },
      { name: "description", content: "Galerie des projets, moodboards et rendus produits par les élèves de Lions Academy." },
      { property: "og:title", content: "Réalisations — Lions Academy" },
      { property: "og:description", content: "Découvrez les travaux de nos élèves : rendus 3D, moodboards et projets de fin de formation." },
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
  component: Realisations,
});

function Realisations() {
  const projects = Route.useLoaderData();
  const [filter, setFilter] = useState<string>("Tous");
  const [active, setActive] = useState<Project | null>(null);

  const list = filter === "Tous" ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <PageHero eyebrow="Galerie" title="Travaux & projets d'élèves" intro="Une sélection de réalisations créées pendant la formation : rendus, moodboards, planches et projets de fin." />
      <Section>
        <div className="flex flex-wrap gap-2 mb-10">
          {PROJECT_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 text-sm rounded-full border transition-all ${filter === c ? "bg-ink text-ivory border-ink" : "border-border hover:border-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <button key={p.id} onClick={() => setActive(p)} className="text-left group block">
              <div className="rounded-2xl overflow-hidden border border-border aspect-[4/5]">
                <img src={p.cover ?? undefined} alt={p.title} loading="lazy" width={1024} height={1024} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{p.category} · {p.student}</span>
                <h3 className="font-display text-lg mt-1">{p.title}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{p.promotion} · {p.status}</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {active && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4 bg-ink/70 backdrop-blur-sm" onClick={() => setActive(null)}>
          <div className="bg-background rounded-3xl max-w-3xl w-full overflow-hidden relative max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActive(null)} aria-label="Fermer" className="absolute top-4 right-4 z-10 grid place-items-center w-10 h-10 rounded-full bg-background/90 border border-border">
              <X size={18} />
            </button>
            <img src={active.cover ?? undefined} alt={active.title} className="w-full h-auto max-h-[60vh] object-cover" />
            <div className="p-8">
              <span className="eyebrow">{active.category}</span>
              <h2 className="mt-3 font-display text-2xl">{active.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{active.student} · {active.promotion} · {active.status}</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{active.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {active.software.map((s) => (
                  <span key={s} className="px-3 py-1 text-xs rounded-full border border-border">{s}</span>
                ))}
              </div>
              {active.gallery && active.gallery.length > 1 && (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {active.gallery.map((g, i) => (
                    <img key={i} src={g} alt={`${active.title} — vue ${i + 1}`} className="rounded-xl border border-border aspect-square object-cover" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
