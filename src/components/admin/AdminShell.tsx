import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Mail, Users, FileText, GraduationCap, Sparkles, CalendarClock, UserSquare2, ChevronRight, Menu, X, KeyRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { clearSession, useAuthSession } from "@/lib/admin/auth";
import { useLogoutMutation } from "@/lib/admin/queries";

// Shared layout for every authenticated /admin/* page.
// Mirrors Lions Academy's palette so the back-office reads as part of
// the same brand without competing with the public site chrome.

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  // Other content sections are stubs until their backend ships.
  disabled?: boolean;
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/registrations", label: "Inscriptions", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/principles", label: "Principes", icon: Sparkles },
  { to: "/admin/programme", label: "Programme", icon: CalendarClock },
  { to: "/admin/trainers", label: "Formateurs", icon: UserSquare2 },
  { to: "/admin/projects", label: "Réalisations", icon: FileText },
  { to: "/admin/formations", label: "Formations", icon: GraduationCap },
];

export function AdminShell({ children, title, eyebrow, actions }: {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthSession();
  const { location } = useRouterState();
  const router = useRouter();
  const logout = useLogoutMutation();

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => {
        clearSession();
        router.navigate({ to: "/admin/login" });
      },
    });
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ivory)" }}>
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 shrink-0 transform border-r transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "var(--ink)", color: "var(--ivory)", borderColor: "color-mix(in oklab, var(--ink) 85%, var(--gold))" }}
      >
        <div className="h-18 flex items-center gap-2.5 px-6 border-b" style={{ borderColor: "color-mix(in oklab, var(--ivory) 12%, transparent)" }}>
          <span className="grid place-items-center w-9 h-9 rounded-full font-display text-base" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>L</span>
          <span className="leading-tight">
            <span className="block font-display text-base tracking-tight">LIONS ACADEMY</span>
            <span className="block text-[10px] uppercase tracking-[0.22em]" style={{ color: "color-mix(in oklab, var(--ivory) 55%, transparent)" }}>Back-office</span>
          </span>
        </div>

        <nav className="px-4 py-6 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.to === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(n.to);
            const baseCls = "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors";

            if (n.disabled) {
              return (
                <span key={n.to} className={`${baseCls} cursor-not-allowed opacity-40`} title="Bientôt disponible">
                  <Icon size={16} />
                  <span className="flex-1">{n.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em]">soon</span>
                </span>
              );
            }

            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className={baseCls}
                style={
                  active
                    ? { background: "color-mix(in oklab, var(--gold) 22%, transparent)", color: "var(--ivory)" }
                    : { color: "color-mix(in oklab, var(--ivory) 75%, transparent)" }
                }
              >
                <Icon size={16} />
                <span className="flex-1">{n.label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: "color-mix(in oklab, var(--ivory) 12%, transparent)" }}>
          <div className="rounded-xl px-3 py-3" style={{ background: "color-mix(in oklab, var(--ivory) 6%, transparent)" }}>
            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: "color-mix(in oklab, var(--ivory) 55%, transparent)" }}>Connecté</div>
            <div className="mt-1 truncate text-sm font-medium">{user?.name ?? "—"}</div>
            <div className="truncate text-[11px]" style={{ color: "color-mix(in oklab, var(--ivory) 55%, transparent)" }}>{user?.role_label ?? user?.role ?? ""}</div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              <Link
                to="/admin/account"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: "var(--gold)" }}
              >
                <KeyRound size={12} /> Mon compte
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: "var(--gold)" }}
              >
                <LogOut size={12} /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 px-5 sm:px-8 border-b backdrop-blur-md" style={{ background: "color-mix(in oklab, var(--ivory) 85%, transparent)", borderColor: "var(--border)" }}>
          <button
            type="button"
            className="lg:hidden grid place-items-center w-10 h-10 rounded-full border"
            style={{ borderColor: "var(--border)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="min-w-0 flex-1">
            {eyebrow && <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</div>}
            {title && <h1 className="truncate font-display text-xl sm:text-2xl">{title}</h1>}
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        <main className="flex-1 px-5 sm:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
