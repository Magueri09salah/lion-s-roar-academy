import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, LogOut, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { ApiClientError } from "@/lib/admin/api";
import { clearSession, useAuthSession } from "@/lib/admin/auth";
import {
  useChangeOwnPasswordMutation,
  useLogoutMutation,
  useMeQuery,
} from "@/lib/admin/queries";

export const Route = createFileRoute("/admin/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Mon compte — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AccountPage() {
  const session = useAuthSession();
  // Refresh the user info on this page so we always show the canonical
  // backend state (e.g. updated last_login_at). Falls back to the cached
  // session.user if the API call fails.
  const { data: liveUser } = useMeQuery(session.isAuthenticated);
  const user = liveUser ?? session.user;

  return (
    <AdminShell eyebrow="Compte" title="Mon compte">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Profile card */}
          <div className="card-elegant">
            <div className="flex items-start gap-4">
              <span className="grid place-items-center w-14 h-14 rounded-full font-display text-xl shrink-0" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
                {initialsOf(user?.name ?? "")}
              </span>
              <div className="min-w-0">
                <div className="font-display text-xl truncate">{user?.name ?? "—"}</div>
                <div className="mt-1 text-xs text-muted-foreground truncate">{user?.email ?? ""}</div>
                {user?.role_label && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: "color-mix(in oklab, var(--gold) 25%, transparent)", color: "var(--ink)" }}>
                    {user.role_label}
                  </div>
                )}
              </div>
            </div>

            <dl className="mt-5 space-y-2 text-xs">
              <Row k="Dernière connexion" v={user?.last_login_at ? formatDateTime(user.last_login_at) : "—"} />
              <Row k="Compte créé le" v={user?.created_at ? formatDateTime(user.created_at) : "—"} />
              <Row k="Statut" v={user?.is_active === false ? "Désactivé" : "Actif"} />
            </dl>
          </div>

          <LogoutEverywhereCard />
        </div>

        <div className="lg:col-span-2">
          <ChangePasswordForm />
        </div>
      </div>
    </AdminShell>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const change = useChangeOwnPasswordMutation();

  const fieldErrors = change.error instanceof ApiClientError ? change.error.details : undefined;
  const topError = (() => {
    const err = change.error;
    if (!err) return null;
    if (!(err instanceof ApiClientError)) return "Erreur inconnue.";
    if (err.status === 0) return "Impossible de joindre l'API.";
    if (err.status === 422 && err.details && Object.keys(err.details).length > 0) return null;
    if (err.status >= 500) return `Erreur serveur (${err.status}).`;
    return err.message;
  })();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    change.mutate(
      {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        onSuccess: () => {
          toast.success("Mot de passe mis à jour");
          setCurrentPassword("");
          setPassword("");
          setPasswordConfirmation("");
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-elegant space-y-5">
      <div className="flex items-start gap-4">
        <span className="grid place-items-center w-11 h-11 rounded-xl shrink-0" style={{ background: "color-mix(in oklab, var(--gold) 22%, transparent)" }}>
          <KeyRound size={18} />
        </span>
        <div>
          <h2 className="font-display text-xl">Changer mon mot de passe</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pour des raisons de sécurité, tous vos autres jetons de connexion seront révoqués.
          </p>
        </div>
      </div>

      {topError && (
        <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)", background: "color-mix(in oklab, var(--terracotta) 8%, transparent)", color: "var(--terracotta)" }}>
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <span>{topError}</span>
        </div>
      )}

      <PasswordField
        id="current_password"
        label="Mot de passe actuel"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
        error={fieldErrors?.current_password?.[0]}
      />
      <PasswordField
        id="new_password"
        label="Nouveau mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        error={fieldErrors?.password?.[0]}
        helper="Au moins 8 caractères, avec lettres, majuscules et chiffres."
      />
      <PasswordField
        id="password_confirmation"
        label="Confirmer le nouveau mot de passe"
        value={passwordConfirmation}
        onChange={setPasswordConfirmation}
        autoComplete="new-password"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={change.isPending}
          className="btn-gold inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {change.isPending ? "Mise à jour…" : "Mettre à jour"}
        </button>
      </div>
    </form>
  );
}

function PasswordField({
  id, label, value, onChange, autoComplete, error, helper,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  error?: string;
  helper?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor={id}>
        <span>{label}</span>
        <button type="button" onClick={() => setShow((v) => !v)} className="text-[10px] underline normal-case tracking-normal">
          {show ? "Masquer" : "Afficher"}
        </button>
      </label>
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        autoComplete={autoComplete}
        minLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      />
      {error && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
      {!error && helper && <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>}
    </div>
  );
}

function LogoutEverywhereCard() {
  const router = useRouter();
  const logout = useLogoutMutation();
  const confirm = useConfirm();

  async function handleClick() {
    const ok = await confirm({
      title: "Se déconnecter partout ?",
      message: "Tous vos appareils seront déconnectés. Vous devrez vous reconnecter sur cet appareil aussi.",
      confirmLabel: "Déconnecter partout",
      tone: "danger",
    });
    if (!ok) return;
    logout.mutate(undefined, {
      onSettled: () => {
        clearSession();
        router.navigate({ to: "/admin/login" });
      },
    });
  }

  return (
    <div className="card-elegant">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{ background: "color-mix(in oklab, var(--terracotta) 12%, transparent)", color: "var(--terracotta)" }}>
          <LogOut size={16} />
        </span>
        <div>
          <h3 className="font-display text-base">Déconnexion</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Révoque tous vos jetons de connexion sur tous les appareils.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={logout.isPending}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        style={{ color: "var(--terracotta)", borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)" }}
      >
        <LogOut size={14} />
        Se déconnecter partout
      </button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}

function initialsOf(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("");
  return initials || "?";
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
