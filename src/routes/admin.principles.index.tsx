import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  useAdminPrinciplesQuery,
  useCreatePrincipleMutation,
  useDeletePrincipleMutation,
  useUpdatePrincipleMutation,
} from "@/lib/admin/queries";
import type { AdminPrinciple } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/principles/")({
  component: PrinciplesAdmin,
  head: () => ({
    meta: [
      { title: "Principes — Lions Academie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; principle: AdminPrinciple };

function PrinciplesAdmin() {
  const { data: items, isLoading } = useAdminPrinciplesQuery();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });

  return (
    <AdminShell
      eyebrow="Contenu"
      title="Principes de l'académie"
      actions={
        <button
          type="button"
          onClick={() => setEditor({ mode: "create" })}
          className="btn-gold !px-4 !py-2 text-sm inline-flex items-center gap-2"
        >
          <Plus size={14} /> Nouveau principe
        </button>
      }
    >
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Les principes sont affichés sur la page d'accueil et la page Académie.
        Désactivez-en un pour le retirer du site sans le supprimer.
      </p>

      <div className="overflow-hidden rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground" style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
              <th className="px-5 py-3 font-medium w-12">#</th>
              <th className="px-5 py-3 font-medium">Titre</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium w-24">État</th>
              <th className="px-5 py-3 font-medium text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {isLoading ? (
              <SkeletonRows />
            ) : !items || items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-muted-foreground">
                  Aucun principe. Cliquez sur « Nouveau principe » pour en ajouter.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 align-top text-xs text-muted-foreground">{p.display_order}</td>
                  <td className="px-5 py-4 align-top font-medium max-w-xs">{p.title}</td>
                  <td className="px-5 py-4 align-top text-muted-foreground text-xs max-w-md">
                    <div className="line-clamp-2">{p.description}</div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    {p.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "oklch(0.42 0.13 145)" }}>
                        <Eye size={12} /> Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <EyeOff size={12} /> Masqué
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditor({ mode: "edit", principle: p })}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        aria-label="Modifier"
                        title="Modifier"
                      >
                        <Pencil size={13} />
                      </button>
                      <DeleteButton principle={p} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editor.mode !== "closed" && (
        <PrincipleEditor
          principle={editor.mode === "edit" ? editor.principle : null}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </AdminShell>
  );
}

function PrincipleEditor({ principle, onClose }: { principle: AdminPrinciple | null; onClose: () => void }) {
  const isEdit = principle !== null;
  const [title, setTitle] = useState(principle?.title ?? "");
  const [description, setDescription] = useState(principle?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState<string>(String(principle?.display_order ?? ""));
  const [isActive, setIsActive] = useState(principle?.is_active ?? true);

  const create = useCreatePrincipleMutation();
  const update = useUpdatePrincipleMutation(principle?.id ?? 0);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      title: title.trim(),
      description: description.trim(),
      display_order: displayOrder ? Number(displayOrder) : undefined,
      is_active: isActive,
    };

    if (isEdit) {
      update.mutate(payload, {
        onSuccess: () => { toast.success("Principe mis à jour"); onClose(); },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Mise à jour impossible"),
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Principe créé"); onClose(); },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Création impossible"),
      });
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Modifier le principe" : "Nouveau principe"}
      className="fixed inset-0 z-[60] grid place-items-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-3xl border w-full max-w-xl max-h-[92vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl">{isEdit ? "Modifier le principe" : "Nouveau principe"}</h2>
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
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="p-title">Titre *</label>
            <input
              id="p-title"
              type="text"
              required
              minLength={2}
              maxLength={200}
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="p-desc">Description *</label>
            <textarea
              id="p-desc"
              required
              minLength={5}
              maxLength={5000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <p className="mt-1 text-[11px] text-muted-foreground">Laisser vide pour ajouter à la fin.</p>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">État</span>
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
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
            <button type="button" onClick={onClose} className="btn-outline-ink !px-4 !py-2 text-sm">
              Annuler
            </button>
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

function DeleteButton({ principle }: { principle: AdminPrinciple }) {
  const remove = useDeletePrincipleMutation(principle.id);
  const confirm = useConfirm();

  async function handleClick() {
    const ok = await confirm({
      title: `Supprimer « ${principle.title} » ?`,
      message: "Cette action est irréversible.",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Principe supprimé"),
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

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 5 }).map((__, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-3 w-3/4 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
