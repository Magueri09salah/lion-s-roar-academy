import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/principles/*. Currently only the index route
// renders content; a detail route can be added later if needed.
export const Route = createFileRoute("/admin/principles")({
  component: () => <Outlet />,
});
