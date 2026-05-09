import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { fetchFormationBySlug } from "@/lib/api";
import { CertificationNotice } from "@/components/site/CertificationNotice";
import { ErrorState } from "@/components/site/States";

export const Route = createFileRoute("/formation/$slug")({
  loader: async ({ params }) => {
    const formation = await fetchFormationBySlug(params.slug);
    if (!formation) throw notFound();
    return { formation };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.formation.title} — Lions Academy` },
      { name: "description", content: loaderData?.formation.summary },
      { property: "og:title", content: `${loaderData?.formation.title} — Lions Academy` },
      { property: "og:description", content: loaderData?.formation.summary },
      { property: "og:image", content: loaderData?.formation.cover },
    ],
  }),
  component: FormationDetail,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-4xl">Formation introuvable</h1>
      <Link to="/formation" className="btn-outline-ink mt-6">Retour aux formations</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="container-page py-24">
        <ErrorState message={error.message} onRetry={() => { router.invalidate(); reset(); }} />
      </div>
    );
  },
});

function FormationDetail() {
  const { formation } = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow={`Formation · ${formation.duration}`}
        title={formation.title}
        intro={formation.summary}
      />
      <Section>
        <div className="grid lg:grid-cols-3 gap-10">
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl overflow-hidden border border-border">
              <img src={formation.cover} alt={formation.title} loading="lazy" width={1024} height={1024} className="w-full h-auto" />
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <Row k="Durée" v={formation.duration} />
              <Row k="Format" v={formation.format} />
              <Row k="Niveau" v={formation.level} />
            </dl>
            <Link to="/inscription" className="btn-gold mt-6 w-full">Je m'inscris</Link>
            <div className="mt-6">
              <CertificationNotice />
            </div>
          </aside>
          <div className="lg:col-span-2 space-y-12">
            <div>
              <span className="eyebrow">Objectifs pédagogiques</span>
              <h2 className="mt-3 font-display text-3xl">Ce que vous apprendrez</h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {formation.objectives.map((o: string) => (
                  <li key={o} className="flex gap-3 text-sm">
                    <Check size={18} style={{ color: "var(--gold)" }} className="shrink-0 mt-0.5" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="eyebrow">Contenu</span>
              <h2 className="mt-3 font-display text-3xl">Catégories de cours</h2>
              <div className="mt-6 grid md:grid-cols-3 gap-5">
                {formation.categories.map((c: { title: string; items: string[] }) => (
                  <div key={c.title} className="card-elegant">
                    <h3 className="font-display text-lg">{c.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {c.items.map((i: string) => <li key={i}>· {i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
