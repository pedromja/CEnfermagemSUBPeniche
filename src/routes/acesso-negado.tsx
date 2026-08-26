import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/acesso-negado")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
