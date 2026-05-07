import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Lions Academy" },
      { name: "description", content: "Politique de confidentialité de Lions Academy : collecte, utilisation et protection de vos données." },
      { property: "og:title", content: "Politique de confidentialité — Lions Academy" },
      { property: "og:description", content: "Comment nous traitons et protégeons vos données personnelles." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Politique de confidentialité" />
      <Section>
        <article className="prose-like max-w-3xl space-y-6 text-muted-foreground leading-relaxed">
          <p>Lions Academy s'engage à protéger la vie privée de ses utilisateurs. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles.</p>
          <h2 className="font-display text-2xl text-foreground">1. Données collectées</h2>
          <p>Nous collectons uniquement les informations que vous nous transmettez via nos formulaires : nom, email, téléphone, ville, niveau d'étude et message.</p>
          <h2 className="font-display text-2xl text-foreground">2. Utilisation</h2>
          <p>Ces informations sont utilisées exclusivement pour traiter votre demande d'inscription ou de contact et vous fournir les informations sollicitées.</p>
          <h2 className="font-display text-2xl text-foreground">3. Conservation</h2>
          <p>Vos données sont conservées pendant la durée nécessaire au traitement de votre demande, puis archivées ou supprimées conformément à la législation en vigueur.</p>
          <h2 className="font-display text-2xl text-foreground">4. Vos droits</h2>
          <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous via la page Contact.</p>
        </article>
      </Section>
    </>
  );
}
