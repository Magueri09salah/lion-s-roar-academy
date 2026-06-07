import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

// Styled <select> wrapper for admin pages. Removes the browser's default
// dropdown arrow and injects a brand chevron so filter/sort selects match
// the rest of the admin chrome.

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  size?: "sm" | "md";
}

export function AdminSelect({ children, size = "md", className = "", style, ...props }: AdminSelectProps) {
  const sizeCls = size === "sm" ? "px-3 py-2 pr-8 text-xs" : "px-4 py-2.5 pr-10 text-sm";
  return (
    <div className="relative inline-block">
      <select
        {...props}
        className={`appearance-none rounded-full border border-border bg-card ${sizeCls} focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer transition-colors hover:border-foreground ${className}`}
        style={style}
      >
        {children}
      </select>
      <ChevronDown
        size={size === "sm" ? 12 : 14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
      />
    </div>
  );
}
