import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/60">
      <div className="container-page flex h-18 items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-ink text-ivory font-display text-base">L</span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-tight">LIONS ACADEMIE</span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Formation d'élite</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm transition-colors relative py-1 ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
                {active && <span className="absolute -bottom-1 left-0 right-0 h-px bg-gold" />}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/inscription" className="hidden sm:inline-flex btn-gold !px-5 !py-2.5 text-sm">
            S'inscrire
          </Link>
          <button
            aria-label="Menu"
            className="lg:hidden grid place-items-center w-10 h-10 rounded-full border border-border"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-page py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-base border-b border-border/60 last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/inscription" onClick={() => setOpen(false)} className="btn-gold mt-3 self-start">
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}