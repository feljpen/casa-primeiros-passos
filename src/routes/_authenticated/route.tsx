import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { isAutenticado } from "@/lib/leads-store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    if (!isAutenticado()) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
