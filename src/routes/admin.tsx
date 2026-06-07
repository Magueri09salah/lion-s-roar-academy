import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { getStoredToken } from "@/lib/admin/auth";

// Parent layout for every /admin/* route.
//
// Auth guard:
//   - beforeLoad checks the Sanctum token in localStorage and redirects
//     to /admin/login if missing. Runs on client navigation only because
//     localStorage doesn't exist during SSR.
//   - For first-paint (SSR) of a protected URL, we render a loading
//     screen instead of <Outlet /> so the dashboard never flashes
//     before the client-side redirect kicks in.
//
// Public auth surfaces (login, forgot-password, reset-password) bypass
// both checks — they need to render normally on SSR.

const PUBLIC_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (PUBLIC_PATHS.has(location.pathname)) return;
    if (typeof window === "undefined") return;

    if (!getStoredToken()) {
      throw redirect({
        to: "/admin/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Back-office — Lions Academie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminLayout() {
  const { location } = useRouterState();
  const isPublicPath = PUBLIC_PATHS.has(location.pathname);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // SSR + initial hydration on a protected URL → render a loading
  // screen. After useEffect runs (post-hydration), beforeLoad will have
  // either redirected to /admin/login or allowed the page through.
  if (!hydrated && !isPublicPath) {
    return <AuthLoading />;
  }

  return (
    <ConfirmProvider>
      <Outlet />
    </ConfirmProvider>
  );
}

function AuthLoading() {
  return (
    <div className="min-h-screen grid place-items-center" style={{ background: "var(--ivory)" }}>
      <div className="text-center">
        <div
          className="w-10 h-10 mx-auto rounded-full border-2 animate-spin"
          style={{
            borderColor: "color-mix(in oklab, var(--gold) 30%, transparent)",
            borderTopColor: "var(--gold)",
          }}
        />
        <div
          className="mt-4 text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "color-mix(in oklab, var(--ink) 55%, transparent)" }}
        >
          Chargement…
        </div>
      </div>
    </div>
  );
}
