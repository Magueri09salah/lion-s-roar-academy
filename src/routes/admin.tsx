import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { getStoredToken } from "@/lib/admin/auth";

// Parent layout for every /admin/* route.
//
// The auth guard lives here in beforeLoad. It runs for any URL starting
// with /admin, but is bypassed for /admin/login itself — otherwise an
// unauthenticated visitor would loop (redirect to login → guard fires →
// redirect to login → …).
//
// This component renders just <Outlet />. The actual back-office chrome
// (sidebar + header) lives in <AdminShell> imported by each leaf page so
// the login screen can render without the shell.

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    // Public auth surfaces — the user must NOT be redirected to /admin/login
    // when visiting these (forgot-password / reset-password are reached
    // when they don't yet have a session).
    const PUBLIC_PATHS = new Set([
      "/admin/login",
      "/admin/forgot-password",
      "/admin/reset-password",
    ]);
    if (PUBLIC_PATHS.has(location.pathname)) return;

    // Server-rendered first paint has no localStorage → token is null;
    // we let the route render and the client will redirect on hydration.
    // For client navigation, we redirect synchronously here.
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
      { title: "Back-office — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminLayout() {
  // ConfirmProvider mounts the styled confirmation dialog used by every
  // delete button in the back-office. Scoped to /admin/* so it doesn't
  // ship to the public site bundle / DOM.
  return (
    <ConfirmProvider>
      <Outlet />
    </ConfirmProvider>
  );
}
