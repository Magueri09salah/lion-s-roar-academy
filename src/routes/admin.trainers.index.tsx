import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save, Upload, GripVertical, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  useAdminTrainersQuery,
  useCreateTrainerMutation,
  useDeleteTrainerMutation,
  useUpdateTrainerMutation,
  useUploadMediaMutation,
} from "@/lib/admin/queries";
import { ApiClientError } from "@/lib/admin/api";
import type { AdminTrainer } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/trainers/")({
  component: TrainersAdmin,
  head: () => ({
    meta: [
      { title: "Formateurs — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; trainer: AdminTrainer };

function TrainersAdmin() {
  const { data: items, isLoading } = useAdminTrainersQuery();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });

  return (
    <AdminShell
      eyebrow="Contenu"
      title="Formateurs"
      actions={
        <button
          type="button"
          onClick={() => setEditor({ mode: "create" })}
          className="btn-gold !px-4 !py-2 text-sm inline-flex items-center gap-2"
        >
          <Plus size={14} /> Nouveau formateur
        </button>
      }
    >
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Les formateurs sont affichés sur la page publique <em>/formateurs</em>.
        Désactivez-en un pour le retirer du site sans le supprimer.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <SkeletonCards />
        ) : !items || items.length === 0 ? (
          <div className="card-elegant text-center py-12 text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
            Aucun formateur enregistré. Cliquez sur « Nouveau formateur » pour démarrer.
          </div>
        ) : (
          items.map((t) => (
            <article
              key={t.id}
              className="card-elegant flex flex-col"
              style={!t.is_active ? { opacity: 0.55 } : undefined}
            >
              <div className="flex items-start gap-4">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.name} className="w-16 h-16 rounded-full object-cover border border-border shrink-0" />
                ) : (
                  <div className="grid place-items-center w-16 h-16 rounded-full font-display text-xl shrink-0" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
                    {t.initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg truncate">{t.name}</h3>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-0.5 truncate">{t.role}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{t.experience} d'expérience</div>
                  <div className="mt-2">
                    {t.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: "oklch(0.42 0.13 145)" }}>
                        <Eye size={11} /> Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                        <EyeOff size={11} /> Masqué
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground line-clamp-3">{t.specialty}</p>

              {t.modules.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {t.modules.slice(0, 3).map((m) => (
                    <span key={m} className="inline-flex px-2 py-0.5 text-[10px] rounded-full border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                      {m}
                    </span>
                  ))}
                  {t.modules.length > 3 && (
                    <span className="text-[10px] text-muted-foreground self-center">+{t.modules.length - 3}</span>
                  )}
                </div>
              )}

              <div className="mt-4 pt-3 border-t flex justify-end gap-1.5" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "edit", trainer: t })}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Modifier"
                  title="Modifier"
                >
                  <Pencil size={13} />
                </button>
                <DeleteButton trainer={t} />
              </div>
            </article>
          ))
        )}
      </div>

      {editor.mode !== "closed" && (
        <TrainerEditor
          trainer={editor.mode === "edit" ? editor.trainer : null}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </AdminShell>
  );
}

function TrainerEditor({ trainer, onClose }: { trainer: AdminTrainer | null; onClose: () => void }) {
  const isEdit = trainer !== null;
  const [slug, setSlug] = useState(trainer?.slug ?? "");
  const [name, setName] = useState(trainer?.name ?? "");
  const [role, setRole] = useState(trainer?.role ?? "");
  const [specialty, setSpecialty] = useState(trainer?.specialty ?? "");
  const [bio, setBio] = useState(trainer?.bio ?? "");
  const [experience, setExperience] = useState(trainer?.experience ?? "");
  const [initials, setInitials] = useState(trainer?.initials ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(trainer?.photo_url ?? null);
  const [modules, setModules] = useState<string[]>(() =>
    trainer && trainer.modules.length > 0 ? [...trainer.modules, ""] : [""],
  );
  const [software, setSoftware] = useState<string[]>(() =>
    trainer && trainer.software.length > 0 ? [...trainer.software, ""] : [""],
  );
  const [instagramUrl, setInstagramUrl] = useState(trainer?.instagram_url ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(trainer?.linkedin_url ?? "");
  const [displayOrder, setDisplayOrder] = useState<string>(String(trainer?.display_order ?? ""));
  const [isActive, setIsActive] = useState(trainer?.is_active ?? true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const create = useCreateTrainerMutation();
  const update = useUpdateTrainerMutation(trainer?.id ?? 0);
  const upload = useUploadMediaMutation();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Auto-derive initials from name if the field is empty or matches the previous auto value.
  function handleNameChange(value: string) {
    setName(value);
    const auto = initialsFromName(value);
    if (initials === "" || initials === initialsFromName(name)) {
      setInitials(auto);
    }
  }

  function handlePickPhoto() {
    fileInput.current?.click();
  }

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;
    upload.mutate(
      { file, folder: "trainers", alt: name || slug || "Photo formateur" },
      {
        onSuccess: (media) => {
          setPhotoUrl(media.url);
          toast.success("Photo téléversée");
        },
        onError: (err) => {
          const msg = err instanceof ApiClientError
            ? (err.details?.file?.[0] ?? err.message)
            : (err instanceof Error ? err.message : "Téléversement échoué");
          toast.error(msg);
        },
      },
    );
  }

  function setItemAt(setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, value: string) {
    setter((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }
  function addRow(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => [...prev, ""]);
  }
  function removeRow(setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) {
    setter((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const payload = {
      slug: slug.trim().toLowerCase(),
      name: name.trim(),
      role: role.trim(),
      specialty: specialty.trim(),
      bio: bio.trim() || null,
      experience: experience.trim(),
      initials: initials.trim(),
      photo_url: photoUrl,
      modules: modules.map((s) => s.trim()).filter(Boolean),
      software: software.map((s) => s.trim()).filter(Boolean),
      instagram_url: instagramUrl.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      display_order: displayOrder ? Number(displayOrder) : undefined,
      is_active: isActive,
    };

    const onError = (err: unknown) => {
      if (err instanceof ApiClientError && err.details) {
        setFieldErrors(err.details);
        setServerError(err.message);
      } else {
        toast.error(err instanceof Error ? err.message : "Action impossible");
      }
    };

    if (isEdit) {
      update.mutate(payload, {
        onSuccess: () => { toast.success("Formateur mis à jour"); onClose(); },
        onError,
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Formateur créé"); onClose(); },
        onError,
      });
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Modifier le formateur" : "Nouveau formateur"}
      className="fixed inset-0 z-[60] grid place-items-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-3xl border w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 bg-background flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl">{isEdit ? "Modifier le formateur" : "Nouveau formateur"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid place-items-center w-9 h-9 rounded-full border hover:border-foreground transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            <X size={15} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {serverError && (
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
              <span>{serverError}</span>
            </div>
          )}

          {/* Photo + initials */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="w-20 h-20 rounded-full object-cover border border-border" />
              ) : (
                <div className="grid place-items-center w-20 h-20 rounded-full font-display text-2xl" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
                  {initials || "??"}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">Photo</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePickPhoto}
                  disabled={upload.isPending}
                  className="btn-outline-ink !px-3 !py-1.5 text-xs inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload size={12} />
                  {upload.isPending ? "Téléversement…" : photoUrl ? "Remplacer" : "Téléverser"}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="inline-flex items-center gap-1 text-xs underline text-muted-foreground hover:text-foreground"
                  >
                    Retirer
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">JPG / PNG / WebP, max {Math.round(8192 / 1024)} Mo.</p>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChosen}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="t-slug" label="Identifiant *" value={slug} onChange={setSlug} placeholder="ex: kb" error={fieldErrors.slug?.[0]} />
            <Field id="t-initials" label="Initiales *" value={initials} onChange={setInitials} maxLength={8} placeholder="KB" error={fieldErrors.initials?.[0]} />
            <Field id="t-name" label="Nom complet *" value={name} onChange={handleNameChange} error={fieldErrors.name?.[0]} className="sm:col-span-2" />
            <Field id="t-role" label="Rôle *" value={role} onChange={setRole} placeholder="Architecte d'intérieur" error={fieldErrors.role?.[0]} />
            <Field id="t-experience" label="Expérience *" value={experience} onChange={setExperience} placeholder="10 ans" error={fieldErrors.experience?.[0]} />
            <Field id="t-specialty" label="Spécialité *" value={specialty} onChange={setSpecialty} error={fieldErrors.specialty?.[0]} className="sm:col-span-2" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="t-bio">Biographie</label>
            <textarea
              id="t-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={5000}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fieldErrors.bio?.[0] && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.bio[0]}</p>}
          </div>

          <ArrayEditor label="Modules enseignés" values={modules} onChange={setModules} onAdd={() => addRow(setModules)} onRemove={(i) => removeRow(setModules, i)} setAt={(i, v) => setItemAt(setModules, i, v)} />
          <ArrayEditor label="Logiciels" values={software} onChange={setSoftware} onAdd={() => addRow(setSoftware)} onRemove={(i) => removeRow(setSoftware, i)} setAt={(i, v) => setItemAt(setSoftware, i, v)} />

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="t-instagram" label="Instagram URL" value={instagramUrl} onChange={setInstagramUrl} placeholder="https://instagram.com/..." error={fieldErrors.instagram_url?.[0]} />
            <Field id="t-linkedin" label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/..." error={fieldErrors.linkedin_url?.[0]} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="t-order">Ordre d'affichage</label>
              <input
                id="t-order"
                type="number"
                min={0}
                max={65535}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="Auto"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">État</span>
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only" />
                <span
                  className="inline-flex w-9 h-5 rounded-full transition-colors p-0.5"
                  style={{ background: isActive ? "var(--gradient-gold)" : "color-mix(in oklab, var(--ink) 12%, transparent)" }}
                >
                  <span
                    className="block w-4 h-4 rounded-full bg-background transition-transform"
                    style={{ transform: isActive ? "translateX(16px)" : "translateX(0)" }}
                  />
                </span>
                {isActive ? "Publié" : "Masqué"}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <button type="button" onClick={onClose} className="btn-outline-ink !px-4 !py-2 text-sm">Annuler</button>
            <button
              type="submit"
              disabled={pending}
              className="btn-gold !px-4 !py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Save size={14} />
              {pending ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  id, label, value, onChange, placeholder, maxLength, error, className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      />
      {error && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
    </div>
  );
}

function ArrayEditor({
  label, values, onAdd, onRemove, setAt,
}: {
  label: string;
  values: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  setAt: (idx: number, value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        <button type="button" onClick={onAdd} className="text-[11px] font-medium underline" style={{ color: "var(--gold)" }}>
          + Ajouter
        </button>
      </div>
      <ul className="space-y-2">
        {values.map((value, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="grid place-items-center text-muted-foreground" aria-hidden="true">
              <GripVertical size={14} />
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => setAt(idx, e.target.value)}
              maxLength={200}
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors text-muted-foreground"
              style={{ borderColor: "var(--border)" }}
              aria-label="Retirer"
            >
              <X size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeleteButton({ trainer }: { trainer: AdminTrainer }) {
  const remove = useDeleteTrainerMutation(trainer.id);
  const confirm = useConfirm();
  async function handleClick() {
    const ok = await confirm({
      title: `Supprimer « ${trainer.name} » ?`,
      message: "Cette action est irréversible.",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Formateur supprimé"),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Suppression impossible"),
    });
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={remove.isPending}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors disabled:opacity-50"
      style={{ borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)", color: "var(--terracotta)" }}
      aria-label="Supprimer"
      title="Supprimer (admin uniquement)"
    >
      <Trash2 size={13} />
    </button>
  );
}

function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-elegant">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 10%, transparent)" }} />
              <div className="h-3 w-1/2 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("");
}
