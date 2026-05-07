import { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  intro,
  children,
  className = "",
  centered = false,
}: {
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <section className={`py-20 sm:py-28 ${className}`}>
      <div className="container-page">
        {(eyebrow || title || intro) && (
          <div className={`max-w-2xl mb-12 ${centered ? "mx-auto text-center" : ""}`}>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl">{title}</h2>}
            {intro && <p className="mt-5 text-base text-muted-foreground leading-relaxed">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}