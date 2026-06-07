import { Link, createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, FileDown, FileSpreadsheet, Search, Settings2, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getStoredToken } from "@/lib/admin/auth";
import { buildConcoursExportUrl, useAdminConcoursQuery, type ExportFormat } from "@/lib/admin/queries";
import type { RegistrationConcoursPriorityValue, RegistrationConcoursStatusValue } from "@/lib/admin/types";

const STATUS_VALUES = ["new", "contacted", "qualified", "converted", "lost"] as const;
const PRIORITY_VALUES = ["high", "medium", "low"] as const;

const searchSchema = z.object({
  q: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  filiere: z.string().optional(),
  city: z.string().optional(),
  regional_grade: z.string().optional(),
  preferred_format: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.string().optional(),
});

export const Route = createFileRoute("/admin/concours/")({
  validateSearch: searchSchema,
  component: ConcoursList,
  head: () => ({
    meta: [
      { title: "Concours ENA — Lions Academie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ConcoursList() {
  const search = useSearch({ from: "/admin/concours/" });
  const navigate = useNavigate({ from: "/admin/concours" });
  const [searchInput, setSearchInput] = useState(search.q ?? "");

  const params = useMemo(
    () => ({
      q: search.q,
      status: (search.status ? [search.status] : undefined) as RegistrationConcoursStatusValue[] | undefined,
      priority: (search.priority ? [search.priority] : undefined) as RegistrationConcoursPriorityValue[] | undefined,
      filiere: search.filiere,
      city: search.city,
      regional_grade: search.regional_grade,
      preferred_format: search.preferred_format,
      sort: search.sort ?? "-priority",
      page: search.page ?? 1,
      per_page: 20,
    }),
    [search],
  );

  const { data, isLoading, isFetching } = useAdminConcoursQuery(params);
  const items = data?.items ?? [];
  const meta = data?.meta;
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  function updateSearch(patch: Partial<typeof search>) {
    navigate({ to: "/admin/concours", search: (prev) => ({ ...prev, ...patch, page: patch.page ?? undefined }) });
  }
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSearch({ q: searchInput.trim() || undefined, page: 1 });
  }

  async function handleExport(format: ExportFormat) {
    setExportingFormat(format);
    try {
      const url = buildConcoursExportUrl(params, format);
      const token = getStoredToken();
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) { toast.error(`Export ${format.toUpperCase()} échoué (${res.status})`); return; }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lions-academy-concours-ena-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch { toast.error(`Export ${format.toUpperCase()} échoué`); }
    finally { setExportingFormat(null); }
  }

  return (
    <AdminShell
      eyebrow="Marketing"
      title="Leads Concours ENA"
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/concours/settings"
            className="btn-outline-ink !px-4 !py-2 text-sm inline-flex items-center gap-2"
            title="Paramétrer les vidéos du landing"
          >
            <Settings2 size={14} /> Vidéos
          </Link>
          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={exportingFormat !== null}
            className="btn-outline-ink !px-4 !py-2 text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FileDown size={14} />
            {exportingFormat === "csv" ? "Export…" : "Exporter CSV"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("xlsx")}
            disabled={exportingFormat !== null}
            className="btn-outline-ink !px-4 !py-2 text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderColor: "color-mix(in oklab, oklch(0.62 0.13 145) 50%, transparent)", color: "oklch(0.32 0.13 145)" }}
          >
            <FileSpreadsheet size={14} />
            {exportingFormat === "xlsx" ? "Export…" : "Exporter Excel"}
          </button>
        </div>
      }
    >
      {/* Status tabs */}
      <nav className="mb-4 flex flex-wrap gap-2 overflow-x-auto">
        <TabPill active={!search.status} label="Tous" count={meta?.status_counts.all} onClick={() => updateSearch({ status: undefined, page: 1 })} />
        {meta?.status_options.map((opt) => (
          <TabPill key={opt.value} active={search.status === opt.value} label={opt.label} count={meta.status_counts[opt.value] ?? 0} onClick={() => updateSearch({ status: opt.value as RegistrationConcoursStatusValue, page: 1 })} />
        ))}
      </nav>

      {/* Priority pills */}
      {meta && (
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground inline-flex items-center gap-1"><Sparkles size={12} /> Priorité :</span>
          <TabPill active={!search.priority} label="Toutes" count={undefined} onClick={() => updateSearch({ priority: undefined, page: 1 })} small />
          {meta.priority_options.map((opt) => (
            <TabPill key={opt.value} active={search.priority === opt.value} label={opt.label} count={meta.priority_counts[opt.value] ?? 0} onClick={() => updateSearch({ priority: opt.value as RegistrationConcoursPriorityValue, page: 1 })} small />
          ))}
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher nom, email, ville, téléphone…"
            className="w-full rounded-full border border-border bg-card pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(""); updateSearch({ q: undefined, page: 1 }); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Effacer"><X size={14} /></button>
          )}
        </form>

        {meta && (
          <>
            <FilterSelect placeholder="Filière" value={search.filiere} options={meta.filiere_options} onChange={(v) => updateSearch({ filiere: v, page: 1 })} />
            <FilterSelect placeholder="Ville" value={search.city} options={meta.city_options.map((c) => ({ value: c, label: c }))} onChange={(v) => updateSearch({ city: v, page: 1 })} />
            <FilterSelect placeholder="Note" value={search.regional_grade} options={meta.grade_options} onChange={(v) => updateSearch({ regional_grade: v, page: 1 })} />
            <FilterSelect placeholder="Format" value={search.preferred_format} options={meta.format_options} onChange={(v) => updateSearch({ preferred_format: v, page: 1 })} />
          </>
        )}

        <AdminSelect
          value={search.sort ?? "-priority"}
          onChange={(e) => updateSearch({ sort: e.target.value })}
        >
          <option value="-priority">Priorité (haut → bas)</option>
          <option value="-submitted_at">Plus récents</option>
          <option value="submitted_at">Plus anciens</option>
          <option value="full_name">Nom (A-Z)</option>
        </AdminSelect>

        {isFetching && !isLoading && <span className="text-xs text-muted-foreground">Mise à jour…</span>}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground" style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
                <th className="px-5 py-3 font-medium">Candidat</th>
                <th className="px-5 py-3 font-medium">Filière</th>
                <th className="px-5 py-3 font-medium">Note</th>
                <th className="px-5 py-3 font-medium">Format</th>
                <th className="px-5 py-3 font-medium">Priorité</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Reçu</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {isLoading ? (
                <SkeletonRows />
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-muted-foreground">Aucun lead trouvé.</td></tr>
              ) : items.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 align-top">
                    <Link to="/admin/concours/$id" params={{ id: String(r.id) }} className="block">
                      <div className="font-medium">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                      <div className="text-xs text-muted-foreground">{r.whatsapp_phone} · {r.city}</div>
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-top text-xs text-muted-foreground">{r.filiere.label}</td>
                  <td className="px-5 py-4 align-top text-xs text-muted-foreground whitespace-nowrap">{r.regional_grade.label}</td>
                  <td className="px-5 py-4 align-top text-xs text-muted-foreground">{r.preferred_format.label}</td>
                  <td className="px-5 py-4 align-top"><StatusBadge status={r.priority} size="sm" /></td>
                  <td className="px-5 py-4 align-top"><StatusBadge status={r.status} size="sm" /></td>
                  <td className="px-5 py-4 align-top text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.submitted_at)}</td>
                  <td className="px-5 py-4 align-top text-right">
                    <Link to="/admin/concours/$id" params={{ id: String(r.id) }} className="text-xs font-medium underline" style={{ color: "var(--gold)" }}>Détails</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.pagination.last_page > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground" style={{ borderColor: "var(--border)" }}>
            <span>Page <strong className="text-foreground">{meta.pagination.current_page}</strong> sur {meta.pagination.last_page} — {meta.pagination.total} résultat{meta.pagination.total > 1 ? "s" : ""}</span>
            <div className="flex gap-2">
              <button type="button" disabled={meta.pagination.current_page <= 1} onClick={() => updateSearch({ page: meta.pagination.current_page - 1 })} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground" style={{ borderColor: "var(--border)" }}><ChevronLeft size={13} /> Précédent</button>
              <button type="button" disabled={meta.pagination.current_page >= meta.pagination.last_page} onClick={() => updateSearch({ page: meta.pagination.current_page + 1 })} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground" style={{ borderColor: "var(--border)" }}>Suivant <ChevronRight size={13} /></button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function TabPill({ active, label, count, onClick, small }: { active: boolean; label: string; count?: number; onClick: () => void; small?: boolean }) {
  const sz = small ? "px-3 py-1 text-[11px]" : "px-4 py-2 text-xs";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border font-medium transition-colors whitespace-nowrap ${sz} ${active ? "border-transparent" : "hover:border-foreground"}`}
      style={active ? { background: "var(--ink)", color: "var(--ivory)", borderColor: "var(--ink)" } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}
    >
      {label}
      {count !== undefined && (
        <span className="rounded-full px-1.5 text-[10px]" style={active ? { background: "color-mix(in oklab, var(--ivory) 18%, transparent)", color: "var(--ivory)" } : { background: "color-mix(in oklab, var(--ink) 8%, transparent)" }}>{count}</span>
      )}
    </button>
  );
}

function FilterSelect({ placeholder, value, options, onChange }: { placeholder: string; value: string | undefined; options: Array<{ value: string; label: string }>; onChange: (v: string | undefined) => void }) {
  return (
    <AdminSelect
      size="sm"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="">{placeholder} — Toutes</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </AdminSelect>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
          <td key={j} className="px-5 py-4"><div className="h-3 w-3/4 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} /></td>
        ))}</tr>
      ))}
    </>
  );
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}
