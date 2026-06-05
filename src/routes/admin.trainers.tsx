import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/trainers/*.
export const Route = createFileRoute("/admin/trainers")({
  component: () => <Outlet />,
});
