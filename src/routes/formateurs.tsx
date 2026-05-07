import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { TRAINERS } from "@/lib/data";

export const Route = createFileRoute("/formateurs")({
  head: () => ({
    meta: [
      { title: "Formateurs — Lions Academy" },
      { name: "description", content: "Découvrez les formateurs de Lions Academy : architectes, designers et enseignants passionnés par la transmission." },
      { property: "og:title", content: "Formateurs — Lions Academy" },
      { property: "og:description", content: "Une équipe pédagogique experte en architecture d'intérieur et design 3D." },
    ],
  }),
  component: Formateurs,
});

function Formateurs() {
  return (
    <>
      <PageHero eyebrow="Équipe pédagogique" title="Des professionnels qui transmettent." intro="Architectes, designers et enseignants : nos formateurs allient expérience de terrain et passion de la pédagogie." />
      <Section>
        <div className="grid md:grid-cols-3 gap-6">
          {TRAINERS.map((t) => (
            <article key={t.name} className="card-elegant text-center">
              <div className="mx-auto grid place-items-center w-24 h-24 rounded-full font-display text-3xl" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
                {t.initials}
              </div>
              <h3 className="mt-5 font-display text-xl">{t.name}</h3>
              <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground mt-1">{t.role}</div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{t.bio}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
