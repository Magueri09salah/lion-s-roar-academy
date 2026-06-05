import { Link, createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useContactMessagesQuery } from "@/lib/admin/queries";
import type { ContactMessageStatusValue } from "@/lib/admin/types";

const STATUS_VALUES = ["new", "read", "replied", "archived"] as const;

const searchSchema = z.object({
  q: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.string().optional(),
});

export const Route = createFileRoute("/admin/messages/")({
  validateSearch: searchSchema,
  component: MessagesList,
  head: () => ({
    meta: [
      { title: "Messages — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function MessagesList() {
  const search = useSearch({ from: "/admin/messages/" });
  const navigate = useNavigate({ from: "/admin/messages" });
  const [searchInput, setSearchInput] = useState(search.q ?? "");

  const params = useMemo(
    () => ({
      q: search.q,
      status: (search.status ? [search.status] : undefined) as ContactMessageStatusValue[] | undefined,
      sort: search.sort ?? "-submitted_at",
      page: search.page ?? 1,
      per_page: 20,
    }),
    [search],
  );

  const { data, isLoading, isFetching } = useContactMessagesQuery(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  function updateSearch(patch: Partial<typeof search>) {
    navigate({
      to: "/admin/messages",
      search: (prev) => ({ ...prev, ...patch, page: patch.page ?? undefined }),
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSearch({ q: searchInput.trim() || undefined, page: 1 });
  }

  return (
    <AdminShell eyebrow="Back-office" title="Messages">
      {/* Status tabs (with counts) */}
      <nav className="mb-6 flex flex-wrap gap-2 overflow-x-auto">
        <TabPill
          active={!search.status}
          label="Tous"
          count={meta?.status_counts.all}
          onClick={() => updateSearch({ status: undefined, page: 1 })}
        />
        {meta?.status_options.map((opt) => (
          <TabPill
            key={opt.value}
            active={search.status === opt.value}
            label={opt.label}
            count={meta.status_counts[opt.value] ?? 0}
            onClick={() => updateSearch({ status: opt.value as ContactMessageStatusValue, page: 1 })}
          />
        ))}
      </nav>

      {/* Search + sort */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher nom, email, sujet, contenu…"
            className="w-full rounded-full border border-border bg-card pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); updateSearch({ q: undefined, page: 1 }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer"
            >
              <X size={14} />
            </button>
          )}
        </form>

        <select
          value={search.sort ?? "-submitted_at"}
          onChange={(e) => updateSearch({ sort: e.target.value })}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm"
        >
          <option value="-submitted_at">Plus récents d'abord</option>
          <option value="submitted_at">Plus anciens d'abord</option>
          <option value="subject">Sujet (A-Z)</option>
          <option value="-subject">Sujet (Z-A)</option>
        </select>

        {isFetching && !isLoading && (
          <span className="text-xs text-muted-foreground">Mise à jour…</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground" style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
                <th className="px-5 py-3 font-medium">Expéditeur</th>
                <th className="px-5 py-3 font-medium">Sujet</th>
                <th className="px-5 py-3 font-medium">Aperçu</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Reçu le</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {isLoading ? (
                <SkeletonRows />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">
                    Aucun message trouvé.
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <Link to="/admin/messages/$id" params={{ id: String(m.id) }} className="block">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                        {m.phone && <div className="text-xs text-muted-foreground">{m.phone}</div>}
                      </Link>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium">{m.subject}</div>
                    </td>
                    <td className="px-5 py-4 align-top text-xs text-muted-foreground max-w-[28ch]">
                      <div className="line-clamp-2">{m.preview}</div>
                    </td>
                    <td className="px-5 py-4 align-top"><StatusBadge status={m.status} size="sm" /></td>
                    <td className="px-5 py-4 align-top text-xs text-muted-foreground whitespace-nowrap">{formatDate(m.submitted_at)}</td>
                    <td className="px-5 py-4 align-top text-right">
                      <Link
                        to="/admin/messages/$id"
                        params={{ id: String(m.id) }}
                        className="text-xs font-medium underline"
                        style={{ color: "var(--gold)" }}
                      >
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.pagination.last_page > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground" style={{ borderColor: "var(--border)" }}>
            <span>
              Page <strong className="text-foreground">{meta.pagination.current_page}</strong> sur {meta.pagination.last_page} —{" "}
              {meta.pagination.total} résultat{meta.pagination.total > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.pagination.current_page <= 1}
                onClick={() => updateSearch({ page: meta.pagination.current_page - 1 })}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground"
                style={{ borderColor: "var(--border)" }}
              >
                <ChevronLeft size={13} /> Précédent
              </button>
              <button
                type="button"
                disabled={meta.pagination.current_page >= meta.pagination.last_page}
                onClick={() => updateSearch({ page: meta.pagination.current_page + 1 })}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-foreground"
                style={{ borderColor: "var(--border)" }}
              >
                Suivant <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function TabPill({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
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
      {count !== undefined && (
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
      )}
    </button>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-3 w-3/4 rounded-full" style={{ background: "color-mix(in oklab, var(--ink) 8%, transparent)" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
