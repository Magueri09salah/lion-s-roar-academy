import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save, Upload, ImagePlus, GripVertical, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  useAdminProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  useUploadMediaMutation,
} from "@/lib/admin/queries";
import { ApiClientError } from "@/lib/admin/api";
import type { AdminProject } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/projects/")({
  component: ProjectsAdmin,
  head: () => ({
    meta: [
      { title: "Réalisations — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

// Categories suggested in the create/edit modal. Admins can still type
// a free-form value — these just speed up the common cases.
const CATEGORY_SUGGESTIONS = [
  "Plans 2D",
  "Modélisations 3D",
  "Rendus",
  "Moodboards",
  "Planches de présentation",
  "Projet de Fin de Formation",
];

const STATUS_SUGGESTIONS = ["Rendu mensuel", "PFF", "Atelier libre"];

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; project: AdminProject };

function ProjectsAdmin() {
  const { data: items, isLoading } = useAdminProjectsQuery();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [filter, setFilter] = useState<string>("Tous");

  // Build the filter chip list from what exists in the DB + "Tous".
  const categories = Array.from(new Set(items?.map((p) => p.category) ?? []));
  const list = filter === "Tous"
    ? items ?? []
    : (items ?? []).filter((p) => p.category === filter);

  return (
    <AdminShell
      eyebrow="Contenu"
      title="Réalisations"
      actions={
        <button
          type="button"
          onClick={() => setEditor({ mode: "create" })}
          className="btn-gold !px-4 !py-2 text-sm inline-flex items-center gap-2"
        >
          <Plus size={14} /> Nouvelle réalisation
        </button>
      }
    >
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Les réalisations apparaissent sur la page publique <em>/realisations</em>.
        Désactivez une réalisation pour la retirer du site sans la supprimer.
      </p>

      {/* Category chips */}
      {categories.length > 0 && (
        <nav className="mb-6 flex flex-wrap gap-2 overflow-x-auto">
          <Chip active={filter === "Tous"} label="Tous" count={items?.length ?? 0} onClick={() => setFilter("Tous")} />
          {categories.map((c) => (
            <Chip
              key={c}
              active={filter === c}
              label={c}
              count={(items ?? []).filter((p) => p.category === c).length}
              onClick={() => setFilter(c)}
            />
          ))}
        </nav>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <SkeletonCards />
        ) : list.length === 0 ? (
          <div className="card-elegant text-center py-12 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            {items?.length === 0
              ? "Aucune réalisation. Cliquez sur « Nouvelle réalisation » pour démarrer."
              : "Aucune réalisation dans cette catégorie."}
          </div>
        ) : (
          list.map((p) => (
            <article
              key={p.id}
              className="card-elegant flex flex-col overflow-hidden !p-0"
              style={!p.is_active ? { opacity: 0.55 } : undefined}
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted/40">
                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">
                    Pas de couverture
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.category}</span>
                  {p.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: "oklch(0.42 0.13 145)" }}>
                      <Eye size={11} /> Publié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <EyeOff size={11} /> Masqué
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-display text-lg leading-tight">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.student_name} · {p.promotion} · {p.status}
                </p>

                {p.gallery_urls.length > 0 && (
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    Galerie : {p.gallery_urls.length} image{p.gallery_urls.length > 1 ? "s" : ""}
                  </div>
                )}

                <div className="mt-auto pt-3 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: "edit", project: p })}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    aria-label="Modifier"
                    title="Modifier"
                  >
                    <Pencil size={13} />
                  </button>
                  <DeleteButton project={p} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {editor.mode !== "closed" && (
        <ProjectEditor
          project={editor.mode === "edit" ? editor.project : null}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </AdminShell>
  );
}

function Chip({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${active ? "border-transparent" : "hover:border-foreground"}`}
      style={
        active
          ? { background: "var(--ink)", color: "var(--ivory)", borderColor: "var(--ink)" }
          : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
      }
    >
      {label}
      <span
        className="rounded-full px-1.5 text-[10px]"
        style={
          active
            ? { background: "color-mix(in oklab, var(--ivory) 18%, transparent)", color: "var(--ivory)" }
            : { background: "color-mix(in oklab, var(--ink) 8%, transparent)" }
        }
      >
        {count}
      </span>
    </button>
  );
}

function ProjectEditor({ project, onClose }: { project: AdminProject | null; onClose: () => void }) {
  const isEdit = project !== null;
  const [title, setTitle] = useState(project?.title ?? "");
  const [studentName, setStudentName] = useState(project?.student_name ?? "");
  const [promotion, setPromotion] = useState(project?.promotion ?? "Promo 2026");
  const [category, setCategory] = useState(project?.category ?? CATEGORY_SUGGESTIONS[0]);
  const [status, setStatus] = useState(project?.status ?? STATUS_SUGGESTIONS[0]);
  const [description, setDescription] = useState(project?.description ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(project?.cover_url ?? null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(project?.gallery_urls ?? []);
  const [software, setSoftware] = useState<string[]>(() =>
    project && project.software.length > 0 ? [...project.software, ""] : [""],
  );
  const [displayOrder, setDisplayOrder] = useState<string>(String(project?.display_order ?? ""));
  const [isActive, setIsActive] = useState(project?.is_active ?? true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const create = useCreateProjectMutation();
  const update = useUpdateProjectMutation(project?.id ?? 0);
  const upload = useUploadMediaMutation();
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleCoverPick() {
    coverInput.current?.click();
  }
  function handleCoverChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    upload.mutate(
      { file, folder: "projects", alt: title || "Couverture réalisation" },
      {
        onSuccess: (media) => { setCoverUrl(media.url); toast.success("Couverture téléversée"); },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Téléversement échoué"),
      },
    );
  }

  function handleGalleryPick() {
    galleryInput.current?.click();
  }
  function handleGalleryChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    // Upload sequentially so we don't hammer the server with N parallel
    // multipart requests. Each success appends to the gallery.
    (async () => {
      for (const file of files) {
        await new Promise<void>((resolve) => {
          upload.mutate(
            { file, folder: "projects/gallery", alt: title || "Vue galerie" },
            {
              onSuccess: (media) => {
                setGalleryUrls((prev) => [...prev, media.url]);
                resolve();
              },
              onError: (err) => {
                toast.error(err instanceof Error ? err.message : "Téléversement échoué");
                resolve();
              },
            },
          );
        });
      }
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} ajoutée${files.length > 1 ? "s" : ""}`);
    })();
  }

  function removeGalleryAt(idx: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function setSoftwareAt(idx: number, value: string) {
    setSoftware((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }
  function addSoftware() { setSoftware((prev) => [...prev, ""]); }
  function removeSoftwareAt(idx: number) {
    setSoftware((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const payload = {
      title: title.trim(),
      student_name: studentName.trim(),
      promotion: promotion.trim(),
      category: category.trim(),
      status: status.trim(),
      description: description.trim() || null,
      cover_url: coverUrl,
      gallery_urls: galleryUrls,
      software: software.map((s) => s.trim()).filter(Boolean),
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
        onSuccess: () => { toast.success("Réalisation mise à jour"); onClose(); },
        onError,
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Réalisation créée"); onClose(); },
        onError,
      });
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Modifier la réalisation" : "Nouvelle réalisation"}
      className="fixed inset-0 z-[60] grid place-items-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-3xl border w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 bg-background flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl">{isEdit ? "Modifier la réalisation" : "Nouvelle réalisation"}</h2>
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
                <p className="mt-2 text-[11px] text-muted-foreground">JPG / PNG / WebP. Affichée en vignette sur la page galerie.</p>
                {fieldErrors.cover_url?.[0] && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.cover_url[0]}</p>}
                <input ref={coverInput} type="file" accept="image/*" className="sr-only" onChange={handleCoverChosen} />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="p-title" label="Titre *" value={title} onChange={setTitle} error={fieldErrors.title?.[0]} className="sm:col-span-2" />
            <Field id="p-student" label="Nom de l'élève *" value={studentName} onChange={setStudentName} error={fieldErrors.student_name?.[0]} />
            <Field id="p-promo" label="Promotion *" value={promotion} onChange={setPromotion} placeholder="Promo 2026" error={fieldErrors.promotion?.[0]} />

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="p-category">Catégorie *</label>
              <input
                id="p-category"
                type="text"
                list="p-category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                style={fieldErrors.category?.[0] ? { borderColor: "var(--terracotta)" } : undefined}
              />
              <datalist id="p-category-options">
                {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
              </datalist>
              {fieldErrors.category?.[0] && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.category[0]}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="p-status">Statut *</label>
              <input
                id="p-status"
                type="text"
                list="p-status-options"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                style={fieldErrors.status?.[0] ? { borderColor: "var(--terracotta)" } : undefined}
              />
              <datalist id="p-status-options">
                {STATUS_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
              {fieldErrors.status?.[0] && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.status[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="p-desc">Description</label>
            <textarea
              id="p-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fieldErrors.description?.[0] && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.description[0]}</p>}
          </div>

          {/* SOFTWARE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Logiciels utilisés</span>
              <button type="button" onClick={addSoftware} className="text-[11px] font-medium underline" style={{ color: "var(--gold)" }}>+ Ajouter</button>
            </div>
            <ul className="space-y-2">
              {software.map((value, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="grid place-items-center text-muted-foreground" aria-hidden="true">
                    <GripVertical size={14} />
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setSoftwareAt(idx, e.target.value)}
                    maxLength={100}
                    placeholder="AutoCAD, SketchUp, Photoshop…"
                    className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => removeSoftwareAt(idx)}
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

          {/* GALLERY */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Galerie ({galleryUrls.length})
              </span>
              <button
                type="button"
                onClick={handleGalleryPick}
                disabled={upload.isPending}
                className="text-[11px] font-medium underline inline-flex items-center gap-1 disabled:opacity-50"
                style={{ color: "var(--gold)" }}
              >
                <ImagePlus size={12} />
                {upload.isPending ? "Téléversement…" : "Ajouter des images"}
              </button>
            </div>
            <input ref={galleryInput} type="file" accept="image/*" multiple className="sr-only" onChange={handleGalleryChosen} />
            {galleryUrls.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                Aucune image. Cliquez sur « Ajouter des images » pour téléverser une ou plusieurs vues.
              </div>
            ) : (
              <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {galleryUrls.map((url, idx) => (
                  <li key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    <img src={url} alt={`Vue ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryAt(idx)}
                      className="absolute top-1.5 right-1.5 grid place-items-center w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "var(--ink)", color: "var(--ivory)" }}
                      aria-label="Retirer cette image"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {fieldErrors.gallery_urls?.[0] && <p className="mt-1 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.gallery_urls[0]}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="p-order">Ordre d'affichage</label>
              <input
                id="p-order"
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

function DeleteButton({ project }: { project: AdminProject }) {
  const remove = useDeleteProjectMutation(project.id);
  const confirm = useConfirm();
  async function handleClick() {
    const ok = await confirm({
      title: `Supprimer « ${project.title} » ?`,
      message: "Cette action est irréversible.",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Réalisation supprimée"),
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
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-elegant !p-0 overflow-hidden">
          <div className="aspect-[4/3]" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
          <div className="p-5 space-y-2">
            <div className="h-3 w-1/3 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
            <div className="h-4 w-3/4 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 10%, transparent)" }} />
            <div className="h-3 w-1/2 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }} />
          </div>
        </div>
      ))}
    </>
  );
}
