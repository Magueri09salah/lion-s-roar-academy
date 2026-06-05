import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/registrations/*.
// Has no UI of its own — each child page (list, detail) imports AdminShell
// directly so they can each provide their own header / actions.
export const Route = createFileRoute("/admin/registrations")({
  component: () => <Outlet />,
});
