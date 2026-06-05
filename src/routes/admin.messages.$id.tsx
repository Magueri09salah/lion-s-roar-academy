import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useContactMessageQuery,
  useDeleteContactMessageMutation,
  useUpdateContactMessageMutation,
} from "@/lib/admin/queries";
import type { ContactMessageStatusValue } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/messages/$id")({
  parseParams: ({ id }) => ({ id: Number(id) }),
  component: MessageDetail,
  head: () => ({
    meta: [
      { title: "Message — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

const STATUS_OPTIONS: { value: ContactMessageStatusValue; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "read", label: "Lu" },
  { value: "replied", label: "Répondu" },
  { value: "archived", label: "Archivé" },
];

function MessageDetail() {
  const { id } = useParams({ from: "/admin/messages/$id" });
  const { data, isLoading, error } = useContactMessageQuery(id);
  const update = useUpdateContactMessageMutation(id);
  const remove = useDeleteContactMessageMutation(id);
  const confirm = useConfirm();

  const [status, setStatus] = useState<ContactMessageStatusValue>("new");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (data) {
      setStatus(data.status.value);
      setNotes(data.admin_notes ?? "");
    }
  }, [data]);

  if (isLoading) {
    return (
      <AdminShell eyebrow="Message" title="Chargement…">
        <div className="card-elegant text-sm text-muted-foreground">Chargement du message…</div>
      </AdminShell>
    );
  }

  if (error || !data) {
    return (
      <AdminShell eyebrow="Message" title="Introuvable">
        <div className="card-elegant text-center py-10">
          <h2 className="font-display text-2xl">Ce message n'existe pas</h2>
          <p className="mt-2 text-sm text-muted-foreground">Il a peut-être été supprimé.</p>
          <Link to="/admin/messages" className="btn-outline-ink mt-6 inline-flex">Retour à la liste</Link>
        </div>
      </AdminShell>
    );
  }

  const dirty = status !== data.status.value || (notes || null) !== (data.admin_notes ?? null);

  function handleSave() {
    update.mutate(
      { status, admin_notes: notes.trim() || null },
      {
        onSuccess: () => toast.success("Message mis à jour"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur lors de la mise à jour"),
      },
    );
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Supprimer ce message ?",
      message: "Cette action est irréversible.",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(undefined, {
      onSuccess: () => {
        toast.success("Message supprimé");
        history.back();
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Suppression impossible"),
    });
  }

  function markAsReplied() {
    update.mutate(
      { status: "replied" },
      {
        onSuccess: () => {
          setStatus("replied");
          toast.success("Marqué comme répondu");
        },
      },
    );
  }

  return (
    <AdminShell
      eyebrow={`#${data.id} · reçu le ${formatDateTime(data.submitted_at)}`}
      title={data.subject}
      actions={
        <Link to="/admin/messages" className="btn-outline-ink !px-4 !py-2 text-sm inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Liste
        </Link>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — sender + message */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-elegant">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-2xl">{data.name}</h2>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <StatusBadge status={data.status} />
                  <span className="text-xs text-muted-foreground">reçu le {formatDateTime(data.submitted_at)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {data.reply_mailto && (
                  <a
                    href={data.reply_mailto}
                    className="btn-ink !px-4 !py-2 text-sm inline-flex items-center gap-2"
                    onClick={markAsReplied}
                  >
                    <Mail size={14} /> Répondre
                  </a>
                )}
                {data.phone && (
                  <a
                    href={`tel:${data.phone}`}
                    className="btn-outline-ink !px-4 !py-2 text-sm inline-flex items-center gap-2"
                  >
                    <Phone size={14} /> Appeler
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <InfoRow icon={Mail} label="Email" value={data.email} />
              {data.phone && <InfoRow icon={Phone} label="Téléphone" value={data.phone} />}
            </div>
          </div>

          <div className="card-elegant">
            <h3 className="font-display text-lg">Sujet</h3>
            <p className="mt-2 text-base font-medium">{data.subject}</p>
          </div>

          <div className="card-elegant">
            <h3 className="font-display text-lg">Message</h3>
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{data.message}</p>
          </div>
        </div>

        {/* Right column — admin actions */}
        <aside className="space-y-6">
          <div className="card-elegant">
            <h3 className="font-display text-lg">Mettre à jour</h3>

            <div className="mt-4">
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Statut</label>
              <div className="grid grid-cols-1 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors ${status === opt.value ? "border-foreground" : "hover:border-foreground"}`}
                    style={{ borderColor: status === opt.value ? "var(--ink)" : "var(--border)", background: status === opt.value ? "color-mix(in oklab, var(--gold) 8%, transparent)" : undefined }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={() => setStatus(opt.value)}
                      className="sr-only"
                    />
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{
                        background: status === opt.value ? "var(--gold)" : "color-mix(in oklab, var(--ink) 15%, transparent)",
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2" htmlFor="notes">
                Notes internes
              </label>
              <textarea
                id="notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Suivi, contexte, etc."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="button"
              disabled={!dirty || update.isPending}
              onClick={handleSave}
              className="btn-gold w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {update.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>

          <div className="card-elegant">
            <h3 className="font-display text-base">Audit</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <Row k="Lu le" v={data.read_at ? formatDateTime(data.read_at) : "—"} />
              <Row k="Répondu le" v={data.replied_at ? formatDateTime(data.replied_at) : "—"} />
              <Row k="Traité par" v={data.handled_by?.name ?? "—"} />
              <Row k="IP" v={data.ip_address ?? "—"} />
            </dl>
          </div>

          <div className="card-elegant">
            <button
              type="button"
              onClick={handleDelete}
              disabled={remove.isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-destructive/10 disabled:opacity-50"
              style={{ color: "var(--terracotta)", borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)" }}
            >
              <Trash2 size={14} />
              Supprimer ce message
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">Réservé aux administrateurs. Action irréversible.</p>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid place-items-center w-8 h-8 rounded-lg shrink-0 mt-0.5" style={{ background: "color-mix(in oklab, var(--gold) 20%, transparent)" }}>
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate font-medium">{value}</div>
      </div>
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

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
