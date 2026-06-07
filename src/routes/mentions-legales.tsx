import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Lions Academie" },
      { name: "description", content: "Mentions légales de Lions Academie." },
      { property: "og:title", content: "Mentions légales — Lions Academie" },
      { property: "og:description", content: "Informations légales relatives au site Lions Academie." },
    ],
  }),
  component: Legal,
});

function Legal() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Mentions légales" />
      <Section>
        <article className="max-w-3xl space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl text-foreground">Éditeur du site</h2>
          <p>{SITE.name} — {SITE.city}</p>
          <p>Email : {SITE.email}<br />Téléphone : {SITE.phone}</p>
          <h2 className="font-display text-2xl text-foreground">Hébergement</h2>
          <p>Le site est hébergé sur une infrastructure cloud sécurisée.</p>
          <h2 className="font-display text-2xl text-foreground">Propriété intellectuelle</h2>
          <p>L'ensemble des contenus présents sur ce site (textes, images, logos) est la propriété exclusive de Lions Academie. Toute reproduction sans autorisation est interdite.</p>
        </article>
      </Section>
    </>
  );
}
