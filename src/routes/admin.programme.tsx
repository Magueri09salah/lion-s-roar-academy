import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/programme/*.
export const Route = createFileRoute("/admin/programme")({
  component: () => <Outlet />,
});
