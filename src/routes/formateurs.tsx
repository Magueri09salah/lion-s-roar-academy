import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Instagram, Linkedin } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CardGridSkeleton, ErrorState } from "@/components/site/States";
import { fetchTrainers } from "@/lib/api";

export const Route = createFileRoute("/formateurs")({
  loader: () => fetchTrainers(),
  head: () => ({
    meta: [
      { title: "Formateurs — Lions Academie" },
      { name: "description", content: "Découvrez les formateurs de Lions Academie : architectes, designers et enseignants passionnés par la transmission." },
      { property: "og:title", content: "Formateurs — Lions Academie" },
      { property: "og:description", content: "Une équipe pédagogique experte en architecture d'intérieur et design 3D." },
    ],
  }),
  pendingComponent: () => (
    <Section><CardGridSkeleton count={3} /></Section>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <Section>
        <ErrorState message={error.message} onRetry={() => { router.invalidate(); reset(); }} />
      </Section>
    );
  },
  component: Formateurs,
});

function Formateurs() {
  const trainers = Route.useLoaderData();

  return (
    <>
      <PageHero eyebrow="Équipe pédagogique" title="Des professionnels qui transmettent." intro="Architectes, designers et enseignants : nos formateurs allient expérience de terrain et passion de la pédagogie." />
      <Section>
        <div className="grid md:grid-cols-3 gap-6">
          {trainers.map((t) => (
            <article key={t.id} className="card-elegant flex flex-col">
              <div className="flex items-center gap-4">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="w-20 h-20 rounded-full object-cover border border-border" />
                ) : (
                  <div className="grid place-items-center w-20 h-20 rounded-full font-display text-2xl shrink-0" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
                    {t.initials}
                  </div>
                )}
                <div>
                  <h3 className="font-display text-xl">{t.name}</h3>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">{t.role}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.experience} d'expérience</div>
                </div>
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{t.bio}</p>
              <div className="mt-5">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Spécialité</div>
                <p className="mt-1 text-sm">{t.specialty}</p>
              </div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Modules enseignés</div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {t.modules.map((m) => <li key={m}>· {m}</li>)}
                </ul>
              </div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Logiciels</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.software.map((s) => <span key={s} className="px-2.5 py-1 text-xs rounded-full border border-border">{s}</span>)}
                </div>
              </div>
              {(t.socials?.instagram || t.socials?.linkedin) && (
                <div className="mt-5 flex gap-2">
                  {t.socials.instagram && <a href={t.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${t.name}`} className="grid place-items-center w-9 h-9 rounded-full border border-border hover:border-foreground"><Instagram size={14} /></a>}
                  {t.socials.linkedin && <a href={t.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${t.name}`} className="grid place-items-center w-9 h-9 rounded-full border border-border hover:border-foreground"><Linkedin size={14} /></a>}
                </div>
              )}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
