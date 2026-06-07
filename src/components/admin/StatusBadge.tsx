import type { StatusTone } from "@/lib/admin/types";

// Common shape across every status enum (Registration, ContactMessage, …).
// We only need `label` for the rendered text and `tone` for the colours.
export interface StatusBadgeData {
  value: string;
  label: string;
  tone: StatusTone;
}

// Backend "tone" → Lions Academie design tokens.
const TONE_STYLES: Record<StatusTone, { bg: string; text: string; border: string }> = {
  gold: {
    bg: "color-mix(in oklab, var(--gold) 18%, transparent)",
    text: "color-mix(in oklab, var(--ink) 90%, transparent)",
    border: "color-mix(in oklab, var(--gold) 50%, transparent)",
  },
  ink: {
    bg: "var(--ink)",
    text: "var(--ivory)",
    border: "var(--ink)",
  },
  sand: {
    bg: "color-mix(in oklab, var(--sand) 60%, transparent)",
    text: "var(--ink)",
    border: "color-mix(in oklab, var(--sand) 80%, transparent)",
  },
  success: {
    bg: "color-mix(in oklab, oklch(0.62 0.13 145) 18%, transparent)",
    text: "oklch(0.32 0.13 145)",
    border: "color-mix(in oklab, oklch(0.62 0.13 145) 50%, transparent)",
  },
  destructive: {
    bg: "color-mix(in oklab, var(--terracotta) 18%, transparent)",
    text: "var(--terracotta)",
    border: "color-mix(in oklab, var(--terracotta) 50%, transparent)",
  },
};

export function StatusBadge({ status, size = "md" }: { status: StatusBadgeData; size?: "sm" | "md" }) {
  const s = TONE_STYLES[status.tone];
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide ${padding}`}
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: s.text, opacity: 0.7 }} />
      {status.label}
    </span>
  );
}
