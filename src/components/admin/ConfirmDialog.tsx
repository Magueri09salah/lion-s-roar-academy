import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Branded replacement for window.confirm() — a styled modal mounted inside
 * the admin shell. Returns a Promise<boolean> so call sites can `await`
 * the user decision without managing local "confirmation pending" state.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   async function handleDelete() {
 *     const ok = await confirm({
 *       title: "Supprimer cette inscription ?",
 *       message: "Cette action est irréversible.",
 *       tone: "danger",
 *     });
 *     if (!ok) return;
 *     mutate(...);
 *   }
 *
 * Provider is mounted once in routes/admin.tsx so only admin pages have
 * access to the hook. Calling useConfirm() outside the provider throws —
 * makes scoping mistakes obvious in development.
 */

export type ConfirmTone = "default" | "danger";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmCtx = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) {
    throw new Error("useConfirm() must be used inside <ConfirmProvider>");
  }
  return ctx;
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve });
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {pending && <ConfirmModal options={pending.options} onResult={settle} />}
    </ConfirmCtx.Provider>
  );
}

function ConfirmModal({ options, onResult }: { options: ConfirmOptions; onResult: (v: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the safe action by default (so a stray Enter doesn't delete).
  // Esc / backdrop cancel; Enter confirms only when focus is on the
  // confirm button.
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onResult(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onResult]);

  const isDanger = options.tone === "danger";
  const confirmLabel = options.confirmLabel ?? (isDanger ? "Supprimer" : "Confirmer");
  const cancelLabel = options.cancelLabel ?? "Annuler";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[80] grid place-items-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={() => onResult(false)}
    >
      <div
        className="bg-background rounded-3xl border w-full max-w-md"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-4 px-6 pt-6 pb-2">
          {isDanger && (
            <span
              className="grid place-items-center w-11 h-11 rounded-full shrink-0"
              style={{
                background: "color-mix(in oklab, var(--terracotta) 12%, transparent)",
                color: "var(--terracotta)",
              }}
              aria-hidden="true"
            >
              <AlertTriangle size={20} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="font-display text-xl leading-snug">{options.title}</h2>
            {options.message && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{options.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onResult(false)}
            aria-label="Fermer"
            className="grid place-items-center w-8 h-8 rounded-full border hover:border-foreground transition-colors shrink-0"
            style={{ borderColor: "var(--border)" }}
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex justify-end gap-2 px-6 pb-6 pt-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onResult(false)}
            className="btn-outline-ink !px-4 !py-2 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onResult(true)}
            className={isDanger ? "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-colors" : "btn-gold !px-4 !py-2 text-sm"}
            style={isDanger ? { background: "var(--terracotta)" } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
