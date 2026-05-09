import { Award } from "lucide-react";

/**
 * Business rule: certification is delivered ONLY after validation of the
 * monthly assignments AND the final project. This notice surfaces that rule
 * on every page where a prospect could otherwise assume attendance is enough.
 */
export function CertificationNotice({ className = "" }: { className?: string }) {
  return (
    <aside
      role="note"
      aria-label="Conditions de certification"
      className={`flex items-start gap-4 rounded-2xl border p-5 sm:p-6 ${className}`}
      style={{
        background: "color-mix(in oklab, var(--gold) 12%, var(--card))",
        borderColor: "color-mix(in oklab, var(--gold) 35%, transparent)",
      }}
    >
      <span
        className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
        style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}
      >
        <Award size={18} />
      </span>
      <div className="text-sm leading-relaxed">
        <strong className="font-display text-base block">Certification</strong>
        <span className="text-muted-foreground">
          Certification uniquement après validation des travaux mensuels et du projet final.
        </span>
      </div>
    </aside>
  );
}
