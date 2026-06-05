import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  useAdminProgrammeQuery,
  useCreateProgramMonthMutation,
  useDeleteProgramMonthMutation,
  useUpdateProgramMonthMutation,
} from "@/lib/admin/queries";
import type { AdminProgramMonth } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/programme/")({
  component: ProgrammeAdmin,
  head: () => ({
    meta: [
      { title: "Programme — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; month: AdminProgramMonth };

function ProgrammeAdmin() {
  const { data: items, isLoading } = useAdminProgrammeQuery();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });

  return (
    <AdminShell
      eyebrow="Contenu"
      title="Programme & calendrier"
      actions={
        <button
          type="button"
          onClick={() => setEditor({ mode: "create" })}
          className="btn-gold !px-4 !py-2 text-sm inline-flex items-center gap-2"
        >
          <Plus size={14} /> Nouveau mois
        </button>
      }
    >
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Les mois du programme sont affichés en ordre de position sur la page publique
        <em> /programme</em>. Désactivez un mois pour le retirer du site sans le supprimer.
      </p>

      <div className="space-y-3">
        {isLoading ? (
          <SkeletonCards />
        ) : !items || items.length === 0 ? (
          <div className="card-elegant text-center py-12 text-sm text-muted-foreground">
            Aucun mois enregistré. Cliquez sur « Nouveau mois » pour démarrer.
          </div>
        ) : (
          items.map((m) => (
            <article
              key={m.id}
              className="card-elegant flex items-start gap-4"
              style={!m.is_active ? { opacity: 0.6 } : undefined}
            >
              <span
                className="grid place-items-center w-11 h-11 rounded-full font-display text-sm shrink-0"
                style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}
                title={`Position ${m.position}`}
              >
                {m.position}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{m.month_label}</span>
                  {m.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: "oklch(0.42 0.13 145)" }}>
                      <Eye size={11} /> Publié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <EyeOff size={11} /> Masqué
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-display text-xl">{m.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{m.objective}</p>

                <div className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <Field label="Cours théorique" value={m.axis} />
                  <Field label="Rendu" value={m.deliverable} />
                </div>

                {m.items.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {m.items.map((i, idx) => (
                      <li
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-full border text-[11px]"
                        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                      >
                        {i}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "edit", month: m })}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Modifier"
                  title="Modifier"
                >
                  <Pencil size={13} />
                </button>
                <DeleteButton month={m} />
              </div>
            </article>
          ))
        )}
      </div>

      {editor.mode !== "closed" && (
        <MonthEditor
          month={editor.mode === "edit" ? editor.month : null}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function MonthEditor({ month, onClose }: { month: AdminProgramMonth | null; onClose: () => void }) {
  const isEdit = month !== null;
  const [position, setPosition] = useState<string>(String(month?.position ?? ""));
  const [monthLabel, setMonthLabel] = useState(month?.month_label ?? "");
  const [title, setTitle] = useState(month?.title ?? "");
  const [axis, setAxis] = useState(month?.axis ?? "");
  const [objective, setObjective] = useState(month?.objective ?? "");
  const [deliverable, setDeliverable] = useState(month?.deliverable ?? "");
  const [items, setItems] = useState<string[]>(() =>
    // Always include one empty input at the end so admins can add without clicking +.
    month && month.items.length > 0 ? [...month.items, ""] : [""],
  );
  const [isActive, setIsActive] = useState(month?.is_active ?? true);

  const create = useCreateProgramMonthMutation();
  const update = useUpdateProgramMonthMutation(month?.id ?? 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Convenience: when position changes and month_label is still the auto pattern
  // "Mois N" matching the old position, sync the label. Doesn't force anything
  // — admin can still set a custom label manually.
  function handlePositionChange(value: string) {
    setPosition(value);
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return;
    const autoLabel = `Mois ${n}`;
    if (monthLabel === "" || /^Mois \d+$/.test(monthLabel)) {
      setMonthLabel(autoLabel);
    }
  }

  function setItemAt(idx: number, value: string) {
    setItems((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }
  function addItem() {
    setItems((prev) => [...prev, ""]);
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanItems = items.map((s) => s.trim()).filter((s) => s !== "");
    const payload = {
      position: Number(position),
      month_label: monthLabel.trim(),
      title: title.trim(),
      axis: axis.trim(),
      objective: objective.trim(),
      deliverable: deliverable.trim(),
      items: cleanItems,
      is_active: isActive,
    };

    if (isEdit) {
      update.mutate(payload, {
        onSuccess: () => { toast.success("Mois mis à jour"); onClose(); },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Mise à jour impossible"),
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Mois créé"); onClose(); },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Création impossible"),
      });
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Modifier le mois" : "Nouveau mois"}
      className="fixed inset-0 z-[60] grid place-items-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-3xl border w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-xl">{isEdit ? "Modifier le mois" : "Nouveau mois"}</h2>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="m-position">Position *</label>
              <input
                id="m-position"
                type="number"
                required
                min={1}
                max={255}
                value={position}
                onChange={(e) => handlePositionChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="m-label">Libellé du mois *</label>
              <input
                id="m-label"
                type="text"
                required
                maxLength={32}
                value={monthLabel}
                onChange={(e) => setMonthLabel(e.target.value)}
                placeholder="Mois 1"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="m-title">Titre *</label>
            <input
              id="m-title"
              type="text"
              required
              minLength={2}
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="m-axis">Cours théorique *</label>
              <input
                id="m-axis"
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={axis}
                onChange={(e) => setAxis(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="m-deliverable">Rendu *</label>
              <input
                id="m-deliverable"
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={deliverable}
                onChange={(e) => setDeliverable(e.target.value)}
                placeholder="Exercice 1, PFF, …"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="m-objective">Objectif *</label>
            <textarea
              id="m-objective"
              required
              minLength={2}
              maxLength={5000}
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">Atelier</span>
              <button
                type="button"
                onClick={addItem}
                className="text-[11px] font-medium underline"
                style={{ color: "var(--gold)" }}
              >
                + Ajouter
              </button>
            </div>
            <ul className="space-y-2">
              {items.map((value, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="grid place-items-center text-muted-foreground" aria-hidden="true">
                    <GripVertical size={14} />
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setItemAt(idx, e.target.value)}
                    maxLength={200}
                    placeholder="Sujet ou exercice"
                    className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border hover:border-foreground transition-colors text-muted-foreground"
                    style={{ borderColor: "var(--border)" }}
                    aria-label="Retirer cet élément"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] text-muted-foreground">Les éléments vides sont ignorés à l'enregistrement.</p>
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

function DeleteButton({ month }: { month: AdminProgramMonth }) {
  const remove = useDeleteProgramMonthMutation(month.id);
  const confirm = useConfirm();

  async function handleClick() {
    const ok = await confirm({
      title: `Supprimer « ${month.month_label} — ${month.title} » ?`,
      message: "Cette action est irréversible.",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Mois supprimé"),
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
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-elegant">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
              <div className="h-4 w-2/3 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 10%, transparent)" }} />
              <div className="h-3 w-full rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
