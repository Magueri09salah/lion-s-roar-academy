import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, MessageCircle, Check, Instagram, Facebook, Youtube } from "lucide-react";
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

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHero eyebrow="Nous contacter" title="Discutons de votre projet." intro="Notre équipe est là pour répondre à vos questions sur la formation, le programme ou l'inscription." />
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
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="card-elegant space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <input name="name" required placeholder="Nom" className="rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input name="email" required type="email" placeholder="Email" className="rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input name="phone" placeholder="Téléphone" className="rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input name="subject" required placeholder="Sujet" className="rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <textarea name="message" required rows={6} placeholder="Votre message" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="submit" className="btn-gold">Envoyer le message</button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
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
