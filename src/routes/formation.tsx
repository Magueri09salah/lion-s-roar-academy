import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { FORMATIONS } from "@/lib/data";

export const Route = createFileRoute("/formation")({
  head: () => ({
    meta: [
      { title: "Formations — Lions Academy" },
      { name: "description", content: "Toutes les formations Lions Academy en architecture d'intérieur et décoration : durée, format, programme." },
      { property: "og:title", content: "Formations — Lions Academy" },
      { property: "og:description", content: "Découvrez nos formations à distance en architecture d'intérieur." },
    ],
  }),
  component: FormationLayout,
});

function FormationLayout() {
  const matches = useMatches();
  const isDetail = matches.some((m) => m.routeId.includes("/formation/$slug"));
  if (isDetail) return <Outlet />;

  return (
    <>
      <PageHero eyebrow="Catalogue" title="Nos formations" intro="Une formation phare en architecture d'intérieur, et bientôt davantage de parcours pour approfondir votre pratique." />
      <Section>
        <div className="grid lg:grid-cols-2 gap-8">
          {FORMATIONS.map((f) => (
            <Link key={f.slug} to="/formation/$slug" params={{ slug: f.slug }} className="group block rounded-3xl overflow-hidden border border-border bg-card transition-all hover:-translate-y-1" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="aspect-[16/10] overflow-hidden">
                <img src={f.cover} alt={f.title} loading="lazy" width={1024} height={640} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-7">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full border border-border">{f.duration}</span>
                  <span className="px-2.5 py-1 rounded-full border border-border">{f.format}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl">{f.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.summary}</p>
                <span className="mt-5 inline-block text-sm font-medium" style={{ color: "var(--gold)" }}>Voir le programme →</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <Outlet />
    </>
  );
}
