import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Mail, ShieldAlert } from "lucide-react";
import { ApiClientError } from "@/lib/admin/api";
import { useForgotPasswordMutation } from "@/lib/admin/queries";

// Standalone page (no AdminShell — user isn't logged in). Mirrors the
// /admin/login visual layout so the flow feels consistent.

export const Route = createFileRoute("/admin/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — Lions Academie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const forgot = useForgotPasswordMutation();

  const topError = (() => {
    const err = forgot.error;
    if (!err) return null;
    if (!(err instanceof ApiClientError)) return "Erreur inconnue.";
    if (err.status === 0) return "Impossible de joindre l'API.";
    if (err.status === 422) return err.details?.email?.[0] ?? "Adresse email invalide.";
    if (err.status >= 500) return `Erreur serveur (${err.status}).`;
    return err.message;
  })();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    forgot.mutate({ email }, { onSuccess: () => setSent(true) });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: "var(--ivory)" }}>
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto grid place-items-center w-14 h-14 rounded-full" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
            <Mail size={22} />
          </div>
          <h1 className="mt-5 font-display text-3xl">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Saisissez votre adresse email — nous vous envoyons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {sent ? (
          <div className="card-elegant mt-8 text-center py-10">
            <div className="mx-auto grid place-items-center w-12 h-12 rounded-full" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
              <Check size={20} />
            </div>
            <h2 className="mt-4 font-display text-xl">Email envoyé</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si un compte existe pour <strong>{email}</strong>, un email avec un lien de réinitialisation vient d'être envoyé.
              Le lien expire dans 60 minutes.
            </p>
            <Link to="/admin/login" className="btn-outline-ink mt-6 inline-flex items-center gap-2">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-elegant mt-8 space-y-5">
            {topError && (
              <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)", background: "color-mix(in oklab, var(--terracotta) 8%, transparent)", color: "var(--terracotta)" }}>
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <span>{topError}</span>
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
            </div>

            <button
              type="submit"
              disabled={forgot.isPending}
              className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {forgot.isPending ? "Envoi…" : "Envoyer le lien"}
            </button>

            <Link to="/admin/login" className="block text-center text-xs underline text-muted-foreground hover:text-foreground">
              ← Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
