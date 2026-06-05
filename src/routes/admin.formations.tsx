import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/formations/*.
export const Route = createFileRoute("/admin/formations")({
  component: () => <Outlet />,
});
