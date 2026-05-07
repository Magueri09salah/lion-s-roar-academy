import { ReactNode } from "react";

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border/60 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="container-page max-w-3xl">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl leading-[1.05]">{title}</h1>
        {intro && <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{intro}</p>}
      </div>
    </section>
  );
}