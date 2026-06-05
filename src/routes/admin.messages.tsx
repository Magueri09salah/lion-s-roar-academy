import { Outlet, createFileRoute } from "@tanstack/react-router";

// Pathless layout for /admin/messages/*.
// Each leaf imports AdminShell directly so it can provide its own
// header / actions, matching the registrations module.
export const Route = createFileRoute("/admin/messages")({
  component: () => <Outlet />,
});
