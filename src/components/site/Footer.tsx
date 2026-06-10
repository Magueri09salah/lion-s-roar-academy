import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { NAV, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ivory">
      <div className="container-page py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Lions Academie"
              width={48}
              height={48}
              className="h-12 w-12 rounded-md object-contain"
            />
            <span className="font-display text-2xl">LIONS ACADEMIE</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-ivory/70 leading-relaxed">
            Une académie de formation à distance dédiée à l'architecture d'intérieur et à la décoration. Apprendre, concevoir, présenter — avec méthode.
          </p>
          <div className="gold-rule mt-8 w-24" />
          <div className="mt-6 flex gap-3">
            <a href={SITE.social.instagram} aria-label="Instagram" className="grid place-items-center w-10 h-10 rounded-full border border-ivory/20 hover:bg-gold hover:text-ink hover:border-gold transition-colors">
              <Instagram size={16} />
            </a>
            <a href={SITE.social.facebook} aria-label="Facebook" className="grid place-items-center w-10 h-10 rounded-full border border-ivory/20 hover:bg-gold hover:text-ink hover:border-gold transition-colors">
              <Facebook size={16} />
            </a>
            <a href={SITE.social.youtube} aria-label="YouTube" className="grid place-items-center w-10 h-10 rounded-full border border-ivory/20 hover:bg-gold hover:text-ink hover:border-gold transition-colors">
              <Youtube size={16} />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.22em] text-gold">Navigation</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-ivory/80">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="hover:text-gold transition-colors">{n.label}</Link></li>
            ))}
            <li><Link to="/inscription" className="hover:text-gold transition-colors">Inscription</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.22em] text-gold">Contact</h4>
          <ul className="mt-5 space-y-3 text-sm text-ivory/80">
            <li className="flex gap-3"><Phone size={16} className="text-gold mt-0.5 shrink-0" />{SITE.phone}</li>
            <li className="flex gap-3"><Mail size={16} className="text-gold mt-0.5 shrink-0" />{SITE.email}</li>
            <li className="flex gap-3"><MapPin size={16} className="text-gold mt-0.5 shrink-0" />{SITE.city}</li>
          </ul>
          <div className="mt-6 flex flex-col gap-2 text-xs text-ivory/60">
            <Link to="/confidentialite" className="hover:text-gold">Politique de confidentialité</Link>
            <Link to="/mentions-legales" className="hover:text-gold">Mentions légales</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-page py-5 text-xs text-ivory/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Lions Academie — Tous droits réservés.</span>
          <span>Conçu avec élégance.</span>
        </div>
      </div>
    </footer>
  );
}