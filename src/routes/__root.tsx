import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="eyebrow">Erreur 404</span>
        <h1 className="mt-4 font-display text-6xl">Page introuvable</h1>
        <p className="mt-4 text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn-gold mt-8">Retour à l'accueil</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Une erreur est survenue</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-ink">Réessayer</button>
          <a href="/" className="btn-outline-ink">Accueil</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lions Academie — Formation en architecture d'intérieur & décoration" },
      { name: "description", content: "Académie de formation à distance en architecture d'intérieur et décoration. Méthode pratique, logiciels professionnels, certificat sur validation." },
      { property: "og:title", content: "Lions Academie" },
      { property: "og:description", content: "Apprendre l'architecture d'intérieur à distance — méthode pratique, structurée et professionnelle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { location } = useRouterState();
  // Hide the public site chrome (Header / Footer / floating WhatsApp button)
  // for any /admin/* route (the back-office has its own shell) AND for
  // any standalone landing page used by an ad campaign — these convert
  // better without nav distractions.
  const isAdminRoute = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const isStandaloneLandingRoute = location.pathname === "/concours-ena" || location.pathname.startsWith("/concours-ena/");
  const hideChrome = isAdminRoute || isStandaloneLandingRoute;

  return (
    <QueryClientProvider client={queryClient}>
      {hideChrome ? (
        <Outlet />
      ) : (
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      )}
      <Toaster richColors closeButton position="top-right" />
    </QueryClientProvider>
  );
}
