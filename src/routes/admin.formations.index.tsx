import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save, Upload, GripVertical, AlertTriangle, FolderTree, Target } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  useAdminFormationsQuery,
  useCreateFormationMutation,
  useDeleteFormationMutation,
  useUpdateFormationMutation,
  useUploadMediaMutation,
} from "@/lib/admin/queries";
import { ApiClientError } from "@/lib/admin/api";
import type { AdminFormation, AdminFormationCategory } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/formations/")({
  component: FormationsAdmin,
  head: () => ({
    meta: [
      { title: "Formations — Lions Academie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; formation: AdminFormation };

function FormationsAdmin() {
  const { data: items, isLoading } = useAdminFormationsQuery();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });

  return (
    <AdminShell
      eyebrow="Contenu"
      title="Formations"
      actions={
        <button
          type="button"
          onClick={() => setEditor({ mode: "create" })}
          className="btn-gold !px-4 !py-2 text-sm inline-flex items-center gap-2"
        >
          <Plus size={14} /> Nouvelle formation
        </button>
      }
    >
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Les formations alimentent la page <em>/formation</em> et la page de détail <em>/formation/&#123;slug&#125;</em>.
        Chaque formation possède une couverture, un résumé, une liste d'objectifs et des catégories de cours imbriquées.
      </p>

      <div className="space-y-4">
        {isLoading ? (
          <SkeletonCards />
        ) : !items || items.length === 0 ? (
          <div className="card-elegant text-center py-12 text-sm text-muted-foreground">
            Aucune formation. Cliquez sur « Nouvelle formation » pour démarrer.
          </div>
        ) : (
          items.map((f) => (
            <article
              key={f.id}
              className="card-elegant !p-0 overflow-hidden grid grid-cols-1 sm:grid-cols-[200px_1fr_auto]"
              style={!f.is_active ? { opacity: 0.55 } : undefined}
            >
              <div className="aspect-[4/3] sm:aspect-auto sm:h-full bg-muted/40">
                {f.cover_url ? (
                  <img src={f.cover_url} alt={f.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">
                    Pas de couverture
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">/{f.slug}</span>
                  {f.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: "oklch(0.42 0.13 145)" }}>
                      <Eye size={11} /> Publié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <EyeOff size={11} /> Masqué
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-display text-xl">{f.title}</h3>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {f.duration && <Pill>{f.duration}</Pill>}
                  {f.format && <Pill>{f.format}</Pill>}
                  {f.level && <Pill>{f.level}</Pill>}
                </div>

                {f.summary && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{f.summary}</p>}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Target size={12} style={{ color: "var(--gold)" }} /> {f.objectives.length} objectif{f.objectives.length > 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FolderTree size={12} style={{ color: "var(--gold)" }} />
                    {f.categories.length} catégorie{f.categories.length > 1 ? "s" : ""} ·{" "}
                    {f.categories.reduce((sum, c) => sum + c.items.length, 0)} éléments
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col gap-1.5 p-3 sm:p-5">
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "edit", formation: f })}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Modifier"
                  title="Modifier"
                >
                  <Pencil size={13} />
                </button>
                <DeleteButton formation={f} />
              </div>
            </article>
          ))
        )}
      </div>

      {editor.mode !== "closed" && (
        <FormationEditor
          formation={editor.mode === "edit" ? editor.formation : null}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </AdminShell>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full border text-[11px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
      {children}
    </span>
  );
}

function FormationEditor({ formation, onClose }: { formation: AdminFormation | null; onClose: () => void }) {
  const isEdit = formation !== null;

  const [slug, setSlug] = useState(formation?.slug ?? "");
  const [title, setTitle] = useState(formation?.title ?? "");
  const [duration, setDuration] = useState(formation?.duration ?? "");
  const [format, setFormat] = useState(formation?.format ?? "");
  const [level, setLevel] = useState(formation?.level ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(formation?.cover_url ?? null);
  const [summary, setSummary] = useState(formation?.summary ?? "");
  const [audience, setAudience] = useState(formation?.audience ?? "");
  const [method, setMethod] = useState(formation?.method ?? "");
  const [certification, setCertification] = useState(formation?.certification ?? "");
  const [objectives, setObjectives] = useState<string[]>(() =>
    formation && formation.objectives.length > 0 ? [...formation.objectives, ""] : [""],
  );
  const [categories, setCategories] = useState<AdminFormationCategory[]>(() =>
    formation && formation.categories.length > 0
      ? formation.categories.map((c) => ({ title: c.title, items: [...c.items, ""] }))
      : [],
  );
  const [displayOrder, setDisplayOrder] = useState<string>(String(formation?.display_order ?? ""));
  const [isActive, setIsActive] = useState(formation?.is_active ?? true);

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const create = useCreateFormationMutation();
  const update = useUpdateFormationMutation(formation?.id ?? 0);
  const upload = useUploadMediaMutation();
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ---- Cover upload -----------------------------------------------------
  function handleCoverPick() { coverInput.current?.click(); }
  function handleCoverChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    upload.mutate(
      { file, folder: "formations", alt: title || "Couverture formation" },
      {
        onSuccess: (media) => { setCoverUrl(media.url); toast.success("Couverture téléversée"); },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Téléversement échoué"),
      },
    );
  }

  // ---- Objectives -------------------------------------------------------
  function setObjAt(idx: number, value: string) {
    setObjectives((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }
  function addObjective() { setObjectives((prev) => [...prev, ""]); }
  function removeObjective(idx: number) { setObjectives((prev) => prev.filter((_, i) => i !== idx)); }

  // ---- Categories (nested) ---------------------------------------------
  function addCategory() {
    setCategories((prev) => [...prev, { title: "", items: [""] }]);
  }
  function removeCategory(catIdx: number) {
    setCategories((prev) => prev.filter((_, i) => i !== catIdx));
  }
  function setCategoryTitle(catIdx: number, value: string) {
    setCategories((prev) => prev.map((c, i) => (i === catIdx ? { ...c, title: value } : c)));
  }
  function addCategoryItem(catIdx: number) {
    setCategories((prev) => prev.map((c, i) => (i === catIdx ? { ...c, items: [...c.items, ""] } : c)));
  }
  function removeCategoryItem(catIdx: number, itemIdx: number) {
    setCategories((prev) =>
      prev.map((c, i) => (i === catIdx ? { ...c, items: c.items.filter((_, j) => j !== itemIdx) } : c)),
    );
  }
  function setCategoryItem(catIdx: number, itemIdx: number, value: string) {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx ? { ...c, items: c.items.map((v, j) => (j === itemIdx ? value : v)) } : c,
      ),
    );
  }

  // ---- Submit -----------------------------------------------------------
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const cleanCategories = categories
      .map((c) => ({
        title: c.title.trim(),
        items: c.items.map((s) => s.trim()).filter(Boolean),
      }))
      .filter((c) => c.title !== "" || c.items.length > 0);

    const payload = {
      slug: slug.trim().toLowerCase(),
      title: title.trim(),
      duration: duration.trim() || null,
      format: format.trim() || null,
      level: level.trim() || null,
      cover_url: coverUrl,
      summary: summary.trim() || null,
      audience: audience.trim() || null,
      method: method.trim() || null,
      certification: certification.trim() || null,
      objectives: objectives.map((s) => s.trim()).filter(Boolean),
      categories: cleanCategories,
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
        onSuccess: () => { toast.success("Formation mise à jour"); onClose(); },
        onError,
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Formation créée"); onClose(); },
        onError,
      });
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Modifier la formation" : "Nouvelle formation"}
      className="fixed inset-0 z-[60] grid place-items-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-3xl border w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 bg-background flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl">{isEdit ? "Modifier la formation" : "Nouvelle formation"}</h2>
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
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

          {/* COVER */}
          <div>
            <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Image de couverture</span>
            <div className="grid sm:grid-cols-[200px_1fr] gap-4 items-start">
              <div className="aspect-[4/3] rounded-xl border border-border bg-card overflow-hidden">
                {coverUrl ? (
                  <img src={coverUrl} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">Aucune image</div>
                )}
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCoverPick}
                    disabled={upload.isPending}
                    className="btn-outline-ink !px-3 !py-1.5 text-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Upload size={12} />
                    {coverUrl ? "Remplacer" : "Téléverser"}
                  </button>
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl(null)}
                      className="inline-flex items-center gap-1 text-xs underline text-muted-foreground hover:text-foreground"
                    >
                      Retirer
                    </button>
                  )}
                </div>
                {fieldErrors.cover_url?.[0] && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.cover_url[0]}</p>}
                <input ref={coverInput} type="file" accept="image/*" className="sr-only" onChange={handleCoverChosen} />
              </div>
            </div>
          </div>

          {/* IDENTITY */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="f-slug" label="Identifiant *" value={slug} onChange={setSlug} placeholder="architecture-interieur" error={fieldErrors.slug?.[0]} />
            <Field id="f-title" label="Titre *" value={title} onChange={setTitle} error={fieldErrors.title?.[0]} />
            <Field id="f-duration" label="Durée" value={duration} onChange={setDuration} placeholder="6 mois" error={fieldErrors.duration?.[0]} />
            <Field id="f-format" label="Format" value={format} onChange={setFormat} placeholder="À distance" error={fieldErrors.format?.[0]} />
            <Field id="f-level" label="Niveau" value={level} onChange={setLevel} placeholder="Débutant accepté" error={fieldErrors.level?.[0]} className="sm:col-span-2" />
          </div>

          {/* PROSE FIELDS */}
          <TextareaField id="f-summary" label="Résumé" value={summary} onChange={setSummary} rows={3} error={fieldErrors.summary?.[0]} />
          <TextareaField id="f-audience" label="Public visé" value={audience} onChange={setAudience} rows={2} error={fieldErrors.audience?.[0]} />
          <TextareaField id="f-method" label="Méthode" value={method} onChange={setMethod} rows={2} error={fieldErrors.method?.[0]} />
          <TextareaField id="f-certification" label="Certification" value={certification} onChange={setCertification} rows={2} error={fieldErrors.certification?.[0]} />

          {/* OBJECTIVES */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Target size={13} style={{ color: "var(--gold)" }} /> Objectifs pédagogiques
              </span>
              <button type="button" onClick={addObjective} className="text-[11px] font-medium underline" style={{ color: "var(--gold)" }}>
                + Ajouter
              </button>
            </div>
            <ul className="space-y-2">
              {objectives.map((value, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="grid place-items-center text-muted-foreground" aria-hidden="true">
                    <GripVertical size={14} />
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setObjAt(idx, e.target.value)}
                    maxLength={300}
                    placeholder="Ex : Comprendre les bases de l'architecture d'intérieur"
                    className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(idx)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors text-muted-foreground"
                    style={{ borderColor: "var(--border)" }}
                    aria-label="Retirer"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* CATEGORIES (nested) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <FolderTree size={13} style={{ color: "var(--gold)" }} /> Catégories de cours
              </span>
              <button type="button" onClick={addCategory} className="text-[11px] font-medium underline" style={{ color: "var(--gold)" }}>
                + Nouvelle catégorie
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                Aucune catégorie. Ajoutez-en une pour structurer le programme.
              </div>
            ) : (
              <ul className="space-y-4">
                {categories.map((cat, catIdx) => (
                  <li
                    key={catIdx}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--ink) 2%, transparent)" }}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => setCategoryTitle(catIdx, e.target.value)}
                        placeholder={`Catégorie ${catIdx + 1} (ex : Logiciels 2D & plans)`}
                        maxLength={200}
                        className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => removeCategory(catIdx)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors shrink-0"
                        style={{ borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)", color: "var(--terracotta)" }}
                        aria-label="Supprimer cette catégorie"
                        title="Supprimer cette catégorie"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Éléments</span>
                      <button
                        type="button"
                        onClick={() => addCategoryItem(catIdx)}
                        className="text-[10px] font-medium underline"
                        style={{ color: "var(--gold)" }}
                      >
                        + Ajouter
                      </button>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {cat.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-2">
                          <span className="grid place-items-center text-muted-foreground" aria-hidden="true">
                            <GripVertical size={12} />
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => setCategoryItem(catIdx, itemIdx, e.target.value)}
                            maxLength={200}
                            placeholder="Élément"
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <button
                            type="button"
                            onClick={() => removeCategoryItem(catIdx, itemIdx)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border hover:border-foreground transition-colors text-muted-foreground"
                            style={{ borderColor: "var(--border)" }}
                            aria-label="Retirer"
                          >
                            <X size={11} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ORDER + STATUS */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="f-order">Ordre d'affichage</label>
              <input
                id="f-order"
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
  id, label, value, onChange, placeholder, error, className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      />
      {error && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
    </div>
  );
}

function TextareaField({
  id, label, value, onChange, rows = 3, error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={5000}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      />
      {error && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
    </div>
  );
}

function DeleteButton({ formation }: { formation: AdminFormation }) {
  const remove = useDeleteFormationMutation(formation.id);
  const confirm = useConfirm();
  async function handleClick() {
    const ok = await confirm({
      title: `Supprimer « ${formation.title} » ?`,
      message: "Les inscriptions liées resteront dans la base mais perdront le lien vers cette formation. Cette action est irréversible.",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Formation supprimée"),
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
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="card-elegant !p-0 overflow-hidden grid grid-cols-[200px_1fr]">
          <div className="h-32" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
          <div className="p-5 space-y-2">
            <div className="h-3 w-1/4 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
            <div className="h-5 w-3/4 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 10%, transparent)" }} />
            <div className="h-3 w-2/3 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }} />
          </div>
        </div>
      ))}
    </>
  );
}
