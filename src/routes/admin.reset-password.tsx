import { Link, createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Check, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ApiClientError } from "@/lib/admin/api";
import { useResetPasswordMutation } from "@/lib/admin/queries";

// The reset-password URL is built by the backend's ResetPasswordNotification
// — it points here with ?token=…&email=… already populated.

const searchSchema = z.object({
  token: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/admin/reset-password")({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Réinitialiser le mot de passe — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ResetPasswordPage() {
  const search = useSearch({ from: "/admin/reset-password" });
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [success, setSuccess] = useState(false);
  const reset = useResetPasswordMutation();

  const fieldErrors = reset.error instanceof ApiClientError ? reset.error.details : undefined;

  const topError = (() => {
    const err = reset.error;
    if (!err) return null;
    if (!(err instanceof ApiClientError)) return "Erreur inconnue.";
    if (err.status === 0) return "Impossible de joindre l'API.";
    // 422 with field errors → shown inline; show the top-level message
    // only when no per-field errors carry the info.
    if (err.status === 422 && err.details && Object.keys(err.details).length > 0) return null;
    if (err.status >= 500) return `Erreur serveur (${err.status}).`;
    return err.message;
  })();

  // Missing token/email → invalid link. Render an error state immediately.
  if (!search.token || !search.email) {
    return (
      <ErrorShell
        title="Lien invalide"
        message="Le lien de réinitialisation est incomplet. Demandez un nouvel email depuis « Mot de passe oublié »."
      />
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    reset.mutate(
      {
        token: search.token as string,
        email: search.email as string,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          // Redirect to login after a short delay so the success message reads.
          setTimeout(() => navigate({ to: "/admin/login" }), 2000);
        },
      },
    );
  }

  if (success) {
    return (
      <ErrorShell
        title="Mot de passe réinitialisé"
        message="Vous allez être redirigé vers la connexion…"
        success
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: "var(--ivory)" }}>
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto grid place-items-center w-14 h-14 rounded-full" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
            <KeyRound size={22} />
          </div>
          <h1 className="mt-5 font-display text-3xl">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pour <strong>{search.email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-elegant mt-8 space-y-5">
          {topError && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)", background: "color-mix(in oklab, var(--terracotta) 8%, transparent)", color: "var(--terracotta)" }}>
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>{topError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="pw">Nouveau mot de passe</label>
            <input
              id="pw"
              type="password"
              required
              autoComplete="new-password"
              autoFocus
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              style={fieldErrors?.password?.[0] ? { borderColor: "var(--terracotta)" } : undefined}
            />
            {fieldErrors?.password?.[0] && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.password[0]}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Au moins 8 caractères, avec lettres, majuscules et chiffres.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="pwc">Confirmer le mot de passe</label>
            <input
              id="pwc"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={reset.isPending}
            className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {reset.isPending ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
          </button>

          <Link to="/admin/login" className="block text-center text-xs underline text-muted-foreground hover:text-foreground">
            ← Retour à la connexion
          </Link>
        </form>
      </div>
    </div>
  );
}

function ErrorShell({ title, message, success }: { title: string; message: string; success?: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: "var(--ivory)" }}>
      <div className="w-full max-w-md card-elegant text-center py-10">
        <div className="mx-auto grid place-items-center w-14 h-14 rounded-full" style={{ background: success ? "var(--gradient-gold)" : "color-mix(in oklab, var(--terracotta) 18%, transparent)", color: success ? "var(--ink)" : "var(--terracotta)" }}>
          {success ? <Check size={22} /> : <ShieldAlert size={22} />}
        </div>
        <h1 className="mt-5 font-display text-2xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <Link to="/admin/login" className="btn-outline-ink mt-6 inline-flex">Aller à la connexion</Link>
      </div>
    </div>
  );
}
