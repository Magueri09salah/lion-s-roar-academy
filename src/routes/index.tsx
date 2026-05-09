import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Compass, GraduationCap, Layers, MessageCircle, Palette } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Section } from "@/components/site/Section";
import { PRINCIPLES, FORMATIONS, PROJECTS } from "@/lib/data";
import { whatsappUrl } from "@/lib/site";
import { CertificationNotice } from "@/components/site/CertificationNotice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lions Academy — Architecture d'intérieur à distance" },
      { name: "description", content: "Formation premium à distance en architecture d'intérieur et décoration. Méthode pratique, logiciels professionnels, projet de fin de formation et certificat." },
      { property: "og:title", content: "Lions Academy — Architecture d'intérieur à distance" },
      { property: "og:description", content: "Apprenez à concevoir, modéliser et présenter un projet d'aménagement intérieur." },
    ],
  }),
  component: HomePage,
});

const PRINCIPLE_ICONS = [GraduationCap, Compass, Layers, Palette, Award, MessageCircle];

function HomePage() {
  const formation = FORMATIONS[0];
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-page pt-12 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="eyebrow">Académie · Édition 2026</span>
            <h1 className="mt-5 text-5xl sm:text-6xl md:text-7xl leading-[1.02]">
              Concevoir l'espace <em className="not-italic" style={{ color: "var(--gold)" }}>avec méthode</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Une formation à distance en architecture d'intérieur et décoration — pratique, structurée et professionnelle. Apprenez à concevoir, modéliser, présenter et défendre un projet.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/inscription" className="btn-gold">
                S'inscrire à la formation <ArrowRight size={16} />
              </Link>
              <Link to="/formation" className="btn-outline-ink">Découvrir le programme</Link>
            </div>
            <div className="mt-12 grid grid-cols-3 max-w-md gap-6 border-t border-border pt-8">
              <Stat n="6" label="mois de formation" />
              <Stat n="100%" label="à distance" />
              <Stat n="1" label="projet de fin" />
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl" style={{ background: "var(--gradient-gold)", opacity: 0.18, filter: "blur(40px)" }} />
            <div className="relative rounded-3xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <img src={hero} alt="Atelier d'architecture d'intérieur Lions Academy" width={1600} height={1024} className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block bg-card rounded-2xl border border-border p-5 max-w-[220px]" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Certificat</div>
              <div className="mt-2 font-display text-lg leading-snug">Délivré sur validation des rendus</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPES */}
      <Section eyebrow="Notre approche" title="Les principes de l'académie" intro="Six engagements pédagogiques qui font la différence Lions Academy.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p, i) => {
            const Icon = PRINCIPLE_ICONS[i];
            return (
              <article key={p.title} className="card-elegant group">
                <div className="grid place-items-center w-12 h-12 rounded-xl text-ink" style={{ background: "color-mix(in oklab, var(--gold) 25%, transparent)" }}>
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 font-display text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </article>
            );
          })}
        </div>
      </Section>

      {/* FORMATION HIGHLIGHT */}
      <Section eyebrow="Formation disponible" title="Architecture d'intérieur & décoration" intro="6 mois pour acquérir les fondations techniques, culturelles et professionnelles du métier.">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden border border-border">
            <img src={formation.cover} alt={formation.title} loading="lazy" width={1024} height={1024} className="w-full h-auto" />
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <Pill>Durée · {formation.duration}</Pill>
              <Pill>{formation.format}</Pill>
              <Pill>{formation.level}</Pill>
            </div>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">{formation.summary}</p>
            <ul className="mt-6 space-y-2.5">
              {formation.objectives.slice(0, 4).map((o) => (
                <li key={o} className="flex gap-3 text-sm">
                  <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--gold)" }} />
                  {o}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/formation/$slug" params={{ slug: formation.slug }} className="btn-ink">Voir la formation</Link>
              <Link to="/programme" className="btn-outline-ink">Programme & calendrier</Link>
            </div>
          </div>
        </div>
      </Section>

      {/* RÉALISATIONS */}
      <Section eyebrow="Réalisations" title="Travaux de nos élèves" intro="Une sélection de rendus, moodboards et projets réalisés pendant la formation.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECTS.slice(0, 4).map((p) => (
            <Link key={p.id} to="/realisations" className="group block">
              <div className="rounded-2xl overflow-hidden border border-border aspect-[4/5]">
                <img src={p.cover} alt={p.title} loading="lazy" width={1024} height={1024} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{p.category}</span>
                <h3 className="font-display text-lg mt-1">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/realisations" className="btn-outline-ink">Voir toutes les réalisations</Link>
        </div>
      </Section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container-page">
          <div className="rounded-3xl p-10 sm:p-16 text-center" style={{ background: "var(--gradient-ink)", color: "var(--ivory)" }}>
            <span className="eyebrow" style={{ color: "color-mix(in oklab, var(--ivory) 70%, transparent)" }}>Rejoignez l'académie</span>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl">Prêt à apprendre l'architecture d'intérieur&nbsp;?</h2>
            <p className="mt-5 max-w-xl mx-auto text-base" style={{ color: "color-mix(in oklab, var(--ivory) 75%, transparent)" }}>
              Inscrivez-vous dès aujourd'hui et lancez votre parcours créatif et professionnel.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/inscription" className="btn-gold">S'inscrire</Link>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-outline-ink" style={{ borderColor: "color-mix(in oklab, var(--ivory) 30%, transparent)", color: "var(--ivory)" }}>
                Discuter sur WhatsApp
              </a>
            </div>
          </div>
          <div className="mt-8 max-w-2xl mx-auto">
            <CertificationNotice />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl">{n}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3.5 py-1.5 text-xs rounded-full border border-border bg-card">
      {children}
    </span>
  );
}
