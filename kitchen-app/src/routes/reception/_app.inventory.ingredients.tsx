import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reception/_app/inventory/ingredients")({
  beforeLoad: () => {
    throw redirect({ to: "/reception/inventory/suppliers", replace: true });
  },
  component: () => null,
});