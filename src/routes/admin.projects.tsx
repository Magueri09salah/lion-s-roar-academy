import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/projects/*.
export const Route = createFileRoute("/admin/projects")({
  component: () => <Outlet />,
});
