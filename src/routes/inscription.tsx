import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageCircle, FileText, Upload, X } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { FORMATIONS } from "@/lib/data";
import { CertificationNotice } from "@/components/site/CertificationNotice";
import { whatsappUrl } from "@/lib/site";

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
  const [files, setFiles] = useState<File[]>([]);
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
                  <Field label="Profession actuelle (optionnel)" name="profession" />
                  <Select label="Disponibilité" name="availability" options={["Temps plein", "Soirs & week-ends", "Flexible"]} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Message (optionnel)</label>
                  <textarea name="message" rows={4} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    Documents à fournir (image, CIN)
                  </label>
                  <label
                    htmlFor="documents"
                    className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border border-dashed border-border bg-card px-4 py-8 text-sm text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <Upload size={20} style={{ color: "var(--gold)" }} />
                    <span><strong className="text-foreground">Cliquez pour téléverser</strong> ou glissez vos fichiers</span>
                    <span className="text-xs">Images, PDF, documents — plusieurs fichiers acceptés</span>
                  </label>
                  <input
                    id="documents"
                    name="documents"
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx"
                    className="sr-only"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />
                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((f, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-xs">
                          <span className="flex items-center gap-2 truncate">
                            <FileText size={14} style={{ color: "var(--gold)" }} />
                            <span className="truncate">{f.name}</span>
                            <span className="text-muted-foreground">({(f.size / 1024).toFixed(0)} Ko)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Retirer le fichier"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <label className="flex items-start gap-3 text-xs text-muted-foreground">
                  <input type="checkbox" required className="mt-1" />
                  J'accepte la <a href="/confidentialite" className="underline">politique de confidentialité</a> et que mes informations soient utilisées pour traiter ma demande d'inscription.
                </label>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="btn-gold">Envoyer ma demande</button>
                  <a
                    href={whatsappUrl("Bonjour, je souhaite m'inscrire à la formation Architecture d'intérieur & Décoration de Lions Academy.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-ink inline-flex items-center gap-2"
                  >
                    <MessageCircle size={16} /> S'inscrire via WhatsApp
                  </a>
                </div>
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
            <div className="card-elegant">
              <h3 className="font-display text-xl flex items-center gap-2">
                <FileText size={18} style={{ color: "var(--gold)" }} />
                Documents à fournir
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Photo / image personnelle", "Copie de la CIN"].map((d) => (
                  <li key={d} className="flex gap-2">
                    <Check size={16} style={{ color: "var(--gold)" }} className="mt-0.5 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                À téléverser directement dans le formulaire ou à envoyer via WhatsApp.
              </p>
            </div>
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
