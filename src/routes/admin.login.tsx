import { Link, createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ApiClientError } from "@/lib/admin/api";
import { useLoginMutation } from "@/lib/admin/queries";
import { getStoredToken } from "@/lib/admin/auth";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/admin/login")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    // If we already have a session, jump straight to the dashboard
    // (or the page the user originally tried to reach).
    if (typeof window === "undefined") return;
    if (getStoredToken()) {
      const target = search.redirect && search.redirect.startsWith("/admin") ? search.redirect : "/admin";
      window.location.replace(target);
    }
  },
  component: AdminLogin,
  head: () => ({
    meta: [
      { title: "Connexion — Lions Academie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminLogin() {
  const search = useSearch({ from: "/admin/login" });
  const navigate = useNavigate();
  const login = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fieldErrors = login.error instanceof ApiClientError ? login.error.details : undefined;
  const topLevelError = (() => {
    const err = login.error;
    if (!err) return null;
    if (!(err instanceof ApiClientError)) return "Erreur inconnue.";
    // 422 with field errors → shown inline below the field, not at the top.
    if (err.status === 422 && err.details && Object.keys(err.details).length > 0) return null;
    if (err.status === 0) {
      const origin = typeof window !== "undefined" ? window.location.origin : "votre origine";
      return `Impossible de joindre l'API. Vérifiez que \`php artisan serve\` tourne et que CORS_ALLOWED_ORIGINS contient ${origin}.`;
    }
    if (err.status === 419) return "Erreur CSRF (419). Redémarrez le backend après la mise à jour de bootstrap/app.php.";
    if (err.status === 401) return "Identifiants invalides.";
    if (err.status === 422) return err.message;
    if (err.status >= 500) return `Erreur serveur (${err.status}). ${err.message}`;
    return err.message;
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Connecté");
          const target = search.redirect && search.redirect.startsWith("/admin") ? search.redirect : "/admin";
          navigate({ to: target });
        },
        onError: (err) => {
          // Always surface SOMETHING in a toast so the click never feels silent.
          if (err instanceof ApiClientError) {
            if (err.status === 0) toast.error("Impossible de joindre le serveur");
            else if (err.status >= 500) toast.error("Erreur serveur");
            else if (err.status === 419) toast.error("Erreur CSRF");
            else if (err.status !== 422) toast.error(err.message);
          } else {
            toast.error("Erreur inconnue");
          }
        },
      },
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: "var(--ivory)" }}>
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto grid place-items-center w-14 h-14 rounded-full font-display text-2xl" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
            L
          </div>
          <h1 className="mt-5 font-display text-3xl">Back-office</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour accéder à l'administration Lions Academie.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-elegant mt-8 space-y-5">
          {topLevelError && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)", background: "color-mix(in oklab, var(--terracotta) 8%, transparent)", color: "var(--terracotta)" }}>
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>{topLevelError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fieldErrors?.email && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.email[0]}</p>}
          </div>

          <div>
            <label className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="password">
              <span>Mot de passe</span>
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[10px] underline normal-case tracking-normal">
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            {fieldErrors?.password && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.password[0]}</p>}
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn size={16} />
            {login.isPending ? "Connexion…" : "Se connecter"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/admin/forgot-password" className="underline hover:text-foreground">
              Mot de passe oublié&nbsp;?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
