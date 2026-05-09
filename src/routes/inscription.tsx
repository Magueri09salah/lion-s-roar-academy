import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { FORMATIONS } from "@/lib/data";
import { CertificationNotice } from "@/components/site/CertificationNotice";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Inscription — Lions Academy" },
      { name: "description", content: "Inscrivez-vous à la formation Lions Academy en architecture d'intérieur et décoration." },
      { property: "og:title", content: "Inscription — Lions Academy" },
      { property: "og:description", content: "Demande d'inscription à la formation à distance Lions Academy." },
    ],
  }),
  component: Inscription,
});

function Inscription() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHero eyebrow="Inscription" title="Rejoignez la prochaine promotion" intro="Remplissez le formulaire ci-dessous : notre équipe vous recontacte sous 48h pour confirmer votre place." />
      <Section>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {sent ? (
              <div className="card-elegant text-center py-16">
                <div className="mx-auto grid place-items-center w-14 h-14 rounded-full" style={{ background: "var(--gradient-gold)" }}>
                  <Check size={22} />
                </div>
                <h2 className="mt-5 font-display text-2xl">Demande envoyée</h2>
                <p className="mt-3 text-sm text-muted-foreground">Merci ! Nous vous recontacterons très prochainement.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="card-elegant space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Nom complet" name="name" required />
                  <Field label="Téléphone WhatsApp" name="phone" type="tel" required />
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Ville" name="city" required />
                  <Select label="Niveau d'étude" name="level" options={["Lycée", "Bac", "Bac+2", "Bac+3", "Bac+5", "Autre"]} />
                  <Select label="Formation choisie" name="formation" options={FORMATIONS.map((f) => f.title)} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Message (optionnel)</label>
                  <textarea name="message" rows={4} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <label className="flex items-start gap-3 text-xs text-muted-foreground">
                  <input type="checkbox" required className="mt-1" />
                  J'accepte que mes informations soient utilisées pour traiter ma demande d'inscription.
                </label>
                <button type="submit" className="btn-gold w-full sm:w-auto">Envoyer ma demande</button>
              </form>
            )}
          </div>
          <aside className="space-y-4">
            <div className="card-elegant">
              <h3 className="font-display text-xl">Pourquoi nous rejoindre ?</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Formation 100% à distance", "6 mois structurés", "Logiciels professionnels", "Certificat sur validation", "Suivi personnalisé"].map((i) => (
                  <li key={i} className="flex gap-2"><Check size={16} style={{ color: "var(--gold)" }} className="mt-0.5 shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
            <div className="card-elegant">
              <h3 className="font-display text-lg">Une question ?</h3>
              <p className="mt-2 text-sm text-muted-foreground">Contactez-nous directement sur WhatsApp pour une réponse immédiate.</p>
            </div>
            <CertificationNotice />
          </aside>
        </div>
      </Section>
    </>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}{required && " *"}</label>
      <input name={name} type={type} required={required} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</label>
      <select name={name} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
