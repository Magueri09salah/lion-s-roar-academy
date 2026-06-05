import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, MessageCircle, Check, Instagram, Facebook, Youtube, AlertTriangle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SITE, whatsappUrl } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lions Academy" },
      { name: "description", content: "Contactez Lions Academy : téléphone, WhatsApp, email ou formulaire. Notre équipe vous répond rapidement." },
      { property: "og:title", content: "Contact — Lions Academy" },
      { property: "og:description", content: "Une question, un projet ? Discutons-en." },
    ],
  }),
  component: Contact,
});

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000").replace(/\/$/, "");

function Contact() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setTopError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: (formData.get("phone") as string | null) || null,
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      let body: { success: boolean; error?: { message: string; details?: Record<string, string[]> } } | null = null;
      try { body = await res.json(); } catch { /* non-JSON response, fall through */ }

      if (!res.ok || !body?.success) {
        if (body?.error?.details) setFieldErrors(body.error.details);
        setTopError(body?.error?.message ?? `Erreur du serveur (${res.status}).`);
        return;
      }

      setSent(true);
    } catch {
      setTopError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Nous contacter" title="Quel est votre demande ?" intro="Notre équipe est là pour répondre à vos questions sur la formation, le programme ou l'inscription." />
      <Section>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <ContactCard icon={Phone} label="Téléphone" value={SITE.phone} href={`tel:${SITE.phone}`} />
            <ContactCard icon={MessageCircle} label="WhatsApp" value="Discuter en direct" href={whatsappUrl()} />
            <ContactCard icon={Mail} label="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
            <ContactCard icon={MapPin} label="Ville" value={SITE.city} />
            <div className="card-elegant">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Réseaux sociaux</div>
              <div className="mt-3 flex gap-2">
                <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid place-items-center w-10 h-10 rounded-full border border-border hover:border-foreground"><Instagram size={16} /></a>
                <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid place-items-center w-10 h-10 rounded-full border border-border hover:border-foreground"><Facebook size={16} /></a>
                <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid place-items-center w-10 h-10 rounded-full border border-border hover:border-foreground"><Youtube size={16} /></a>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            {sent ? (
              <div className="card-elegant text-center py-16">
                <div className="mx-auto grid place-items-center w-14 h-14 rounded-full" style={{ background: "var(--gradient-gold)" }}>
                  <Check size={22} />
                </div>
                <h2 className="mt-5 font-display text-2xl">Message envoyé</h2>
                <p className="mt-3 text-sm text-muted-foreground">Merci, nous vous répondons sous 48h.</p>
                <button type="button" onClick={() => setSent(false)} className="btn-outline-ink mt-6">
                  Envoyer un autre message
                </button>
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
                  <ContactField name="name" placeholder="Nom" required error={fieldErrors.name?.[0]} />
                  <ContactField name="email" type="email" placeholder="Email" required error={fieldErrors.email?.[0]} />
                  <ContactField name="phone" placeholder="Téléphone (optionnel)" error={fieldErrors.phone?.[0]} />
                  <ContactField name="subject" placeholder="Sujet" required error={fieldErrors.subject?.[0]} />
                </div>
                <div>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="Votre message"
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    style={fieldErrors.message?.[0] ? { borderColor: "var(--terracotta)" } : undefined}
                  />
                  {fieldErrors.message?.[0] && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.message[0]}</p>}
                </div>
                <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? "Envoi…" : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

function ContactField({ name, placeholder, type = "text", required, error }: { name: string; placeholder: string; type?: string; required?: boolean; error?: string }) {
  return (
    <div>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      />
      {error && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const inner = (
    <div className="card-elegant flex items-start gap-4">
      <span className="grid place-items-center w-11 h-11 rounded-xl shrink-0" style={{ background: "color-mix(in oklab, var(--gold) 25%, transparent)" }}>
        <Icon size={18} />
      </span>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="font-medium mt-1">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a> : inner;
}
