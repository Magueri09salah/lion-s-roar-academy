import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageCircle, FileText, Upload, X, AlertTriangle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CardGridSkeleton, ErrorState } from "@/components/site/States";
import { fetchFormations } from "@/lib/api";
import { CertificationNotice } from "@/components/site/CertificationNotice";
import { whatsappUrl } from "@/lib/site";

export const Route = createFileRoute("/inscription")({
  // Populate the formation dropdown from the live API so the choices
  // reflect what the admin has actually published.
  loader: () => fetchFormations(),
  head: () => ({
    meta: [
      { title: "Inscription — Lions Academy" },
      { name: "description", content: "Inscrivez-vous à la formation Lions Academy en architecture d'intérieur et décoration." },
      { property: "og:title", content: "Inscription — Lions Academy" },
      { property: "og:description", content: "Demande d'inscription à la formation à distance Lions Academy." },
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
  component: Inscription,
});

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000").replace(/\/$/, "");

function Inscription() {
  const formations = Route.useLoaderData();
  const [sent, setSent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Per-field validation errors returned by Laravel (key → list of messages).
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  // Top-level (non-field) message shown above the form.
  const [topError, setTopError] = useState<string | null>(null);
  // WhatsApp continuation URL returned by the API after a successful submission.
  const [whatsappContinue, setWhatsappContinue] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setTopError(null);

    // Build the multipart body manually so the documents list reflects
    // the on-screen state (the user may have removed some files via the
    // "X" button after picking them in the native input).
    const formData = new FormData(e.currentTarget);
    formData.delete("documents");
    files.forEach((f) => formData.append("documents[]", f));

    try {
      const res = await fetch(`${API_BASE}/api/v1/registrations`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      let body: { success: boolean; data?: { whatsapp_redirect_url?: string }; error?: { message: string; code: string; details?: Record<string, string[]> } } | null = null;
      try {
        body = await res.json();
      } catch {
        // Non-JSON response (e.g. 500 HTML page). Fall through to generic error below.
      }

      if (!res.ok || !body?.success) {
        if (body?.error?.details) {
          // Normalise: Laravel returns "documents.0" for array items — strip the index for the input mapping.
          setFieldErrors(mapErrors(body.error.details));
        }
        setTopError(body?.error?.message ?? `Erreur du serveur (${res.status}).`);
        return;
      }

      setWhatsappContinue(body.data?.whatsapp_redirect_url ?? null);
      setSent(true);
      // Clear files; the success state replaces the form anyway, but if
      // the user clicks "Nouvelle demande" we don't want stale uploads.
      setFiles([]);
    } catch {
      setTopError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

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
                <div className="mt-6 flex justify-center gap-3 flex-wrap">
                  {whatsappContinue && (
                    <a
                      href={whatsappContinue}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold inline-flex items-center gap-2"
                    >
                      <MessageCircle size={16} /> Continuer sur WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setWhatsappContinue(null);
                    }}
                    className="btn-outline-ink"
                  >
                    Nouvelle demande
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-elegant space-y-5">
                {topError && (
                  <div
                    className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
                    style={{
                      borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)",
                      background: "color-mix(in oklab, var(--terracotta) 8%, transparent)",
                      color: "var(--terracotta)",
                    }}
                    role="alert"
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{topError}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Nom complet" name="name" required error={fieldErrors.name?.[0] ?? fieldErrors.full_name?.[0]} />
                  <Field label="Téléphone WhatsApp" name="phone" type="tel" required error={fieldErrors.phone?.[0] ?? fieldErrors.whatsapp_phone?.[0]} />
                  <Field label="Email" name="email" type="email" required error={fieldErrors.email?.[0]} />
                  <Field label="Ville" name="city" required error={fieldErrors.city?.[0]} />
                  <Field label="Adresse précise" name="address" required error={fieldErrors.address?.[0]} />
                  <Select label="Niveau d'étude" name="level" options={["Lycée", "Bac", "Bac+2", "Bac+3", "Bac+5", "Autre"]} error={fieldErrors.level?.[0] ?? fieldErrors.education_level?.[0]} />
                  <Select label="Formation choisie" name="formation" options={formations.map((f) => f.title)} error={fieldErrors.formation?.[0]} />
                  <Field label="Profession actuelle (optionnel)" name="profession" error={fieldErrors.profession?.[0]} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Message (optionnel)</label>
                  <textarea name="message" rows={4} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {fieldErrors.message?.[0] && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.message[0]}</p>}
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
                  {/* Surface document-level upload errors (e.g. file too large / wrong mime). */}
                  {fieldErrors.documents?.[0] && (
                    <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.documents[0]}</p>
                  )}
                </div>
                <label className="flex items-start gap-3 text-xs text-muted-foreground">
                  <input type="checkbox" name="privacy_accepted" value="1" required className="mt-1" />
                  J'accepte la <a href="/confidentialite" className="underline">politique de confidentialité</a> et que mes informations soient utilisées pour traiter ma demande d'inscription.
                </label>
                {fieldErrors.privacy_accepted?.[0] && (
                  <p className="-mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.privacy_accepted[0]}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? "Envoi…" : "Envoyer ma demande"}
                  </button>
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

/** Collapse `documents.0`, `documents.1` (etc.) into a single `documents` key. */
function mapErrors(details: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(details)) {
    const key = k.startsWith("documents.") ? "documents" : k;
    out[key] = [...(out[key] ?? []), ...v];
  }
  return out;
}

function Field({ label, name, type = "text", required, error }: { label: string; name: string; type?: string; required?: boolean; error?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}{required && " *"}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      />
      {error && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
    </div>
  );
}

function Select({ label, name, options, error }: { label: string; name: string; options: string[]; error?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</label>
      <select
        name={name}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {error && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
    </div>
  );
}
