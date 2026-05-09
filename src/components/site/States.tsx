import { Skeleton } from "@/components/ui/skeleton";

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-elegant">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="mt-5 h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message = "Une erreur est survenue lors du chargement.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="card-elegant text-center py-12">
      <h3 className="font-display text-2xl">Chargement impossible</h3>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline-ink mt-6">
          Réessayer
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "Aucun contenu à afficher pour le moment." }: { message?: string }) {
  return (
    <div className="card-elegant text-center py-12">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
