import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PERSONAS, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;
    if (user) navigate({ to: PERSONAS[user.persona].route });
    else navigate({ to: "/login" });
  }, [ready, user, navigate]);
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-muted-foreground text-sm">Loading FInsightZ…</div>
    </div>
  );
}
