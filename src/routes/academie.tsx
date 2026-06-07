import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CardGridSkeleton, ErrorState } from "@/components/site/States";
import { fetchPrinciples } from "@/lib/api";

export const Route = createFileRoute("/academie")({
  // Read principles from the live API so admin edits via /admin/principles
  // are reflected immediately (no redeploy needed).
  loader: () => fetchPrinciples(),
  head: () => ({
    meta: [
      { title: "L'Académie — Lions Academie" },
      { name: "description", content: "Découvrez la philosophie pédagogique de Lions Academie : formation à distance, méthode pratique et orientée métier." },
      { property: "og:title", content: "L'Académie — Lions Academie" },
      { property: "og:description", content: "Notre vision pédagogique pour former les futurs architectes d'intérieur." },
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
  component: Academie,
});

function Academie() {
  const principles = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Notre académie"
        title="Une école de design pensée pour le métier."
        intro="Lions Academie forme à distance des passionnés d'architecture d'intérieur et de décoration, avec une méthode complète qui combine technique, logiciels, culture et pratique."
      />
      <Section eyebrow="Philosophie" title="Apprendre l'espace, transmettre un métier">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <p className="text-muted-foreground leading-relaxed">
            Notre approche refuse l'apprentissage purement théorique ou l'usage isolé d'un logiciel. Nous croyons qu'un bon architecte d'intérieur doit penser l'espace, comprendre l'histoire des formes, maîtriser les outils et savoir présenter ses idées avec clarté.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Chaque module est conçu pour développer simultanément les bases techniques, la sensibilité esthétique et la rigueur professionnelle nécessaires pour évoluer dans le secteur — en agence ou à son compte.
          </p>
        </div>
      </Section>
      <Section eyebrow="Nos engagements" title="Les principes de l'académie" className="bg-secondary/40">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <article key={p.title} className="card-elegant">
              <div className="font-display text-3xl" style={{ color: "var(--gold)" }}>0{i + 1}</div>
              <h3 className="mt-3 font-display text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section centered title="Une formation. Une vision. Un certificat." intro="Le certificat Lions Academie est délivré uniquement après validation de tous les rendus mensuels et du Projet de Fin de Formation.">
        <div className="text-center">
          <Link to="/inscription" className="btn-gold">Rejoindre la prochaine promo</Link>
        </div>
      </Section>
    </>
  );
}
