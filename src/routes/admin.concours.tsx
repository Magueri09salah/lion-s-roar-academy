import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/concours/*. Each leaf imports AdminShell.
export const Route = createFileRoute("/admin/concours")({
  component: () => <Outlet />,
});
