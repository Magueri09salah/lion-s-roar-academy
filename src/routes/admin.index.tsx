import { Link, createFileRoute } from "@tanstack/react-router";
import { Users, Mail, FileText, GraduationCap, ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useAdminFormationsQuery,
  useAdminProjectsQuery,
  useContactMessagesQuery,
  useRegistrationsQuery,
} from "@/lib/admin/queries";
import { useAuthSession } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Tableau de bord — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminDashboard() {
  const { user } = useAuthSession();
  const { data, isLoading } = useRegistrationsQuery({ per_page: 5, sort: "-submitted_at" });
  const { data: messagesData } = useContactMessagesQuery({ per_page: 1, sort: "-submitted_at" });
  // Admin endpoints return ALL rows (no filter on is_active) so these
  // counts represent the full DB state — matching what the admin sees
  // when they navigate into each module.
  const { data: projectsData } = useAdminProjectsQuery();
  const { data: formationsData } = useAdminFormationsQuery();
  const counts = data?.meta?.status_counts;
  const messageCounts = messagesData?.meta?.status_counts;
  const projectsCount = projectsData?.length;
  const publishedProjects = projectsData?.filter((p) => p.is_active).length;
  const formationsCount = formationsData?.length;
  const publishedFormations = formationsData?.filter((f) => f.is_active).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bonjour";
    return "Bonsoir";
  })();

  return (
    <AdminShell
      eyebrow="Vue d'ensemble"
      title={`${greeting}${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
    >
      {/* Stat cards — Lions Academy palette */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Inscriptions"
          value={counts?.all}
          highlight={counts?.new}
          highlightLabel="nouvelles"
          href="/admin/registrations"
          accent
        />
        <StatCard
          icon={Mail}
          label="Messages"
          value={messageCounts?.all}
          highlight={messageCounts?.new}
          highlightLabel="non lus"
          href="/admin/messages"
        />
        <StatCard
          icon={GraduationCap}
          label="Formations"
          value={formationsCount}
          highlight={publishedFormations}
          highlightLabel="publiées"
          href="/admin/formations"
        />
        <StatCard
          icon={FileText}
          label="Réalisations"
          value={projectsCount}
          highlight={publishedProjects}
          highlightLabel="publiées"
          href="/admin/projects"
        />
      </section>

      {/* Recent registrations */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl">Dernières inscriptions</h2>
          <Link to="/admin/registrations" className="text-sm font-medium inline-flex items-center gap-1" style={{ color: "var(--gold)" }}>
            Tout voir <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground">Chargement…</div>
          ) : data?.items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Aucune inscription pour l'instant.</div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {data?.items.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/admin/registrations/$id"
                    params={{ id: String(r.id) }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="grid place-items-center w-10 h-10 rounded-full font-display text-sm shrink-0" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
                      {initialsOf(r.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{r.full_name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {r.email} · {r.city} · {r.formation.title ?? "—"}
                      </div>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
  highlightLabel,
  href,
  accent,
  muted,
}: {
  icon: typeof Users;
  label: string;
  value: number | undefined;
  highlight?: number;
  highlightLabel?: string;
  href?: string;
  accent?: boolean;
  muted?: boolean;
}) {
  const content = (
    <div
      className="card-elegant h-full flex flex-col"
      style={muted ? { opacity: 0.55 } : undefined}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid place-items-center w-10 h-10 rounded-xl"
          style={{ background: accent ? "var(--gradient-gold)" : "color-mix(in oklab, var(--ink) 7%, transparent)", color: accent ? "var(--ink)" : "var(--ink)" }}
        >
          <Icon size={18} />
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 font-display text-4xl">{value ?? "—"}</div>
      {highlight !== undefined && highlight > 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />
          <span style={{ color: "var(--ink)" }}>{highlight} {highlightLabel}</span>
        </div>
      )}
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : content;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
