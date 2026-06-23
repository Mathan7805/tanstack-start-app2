import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Crown, Briefcase, Globe, Target, AlertCircle } from "lucide-react";

export const ceoNav = [
  { label: "Enterprise Pulse", href: "/ceo", icon: Crown },
  { label: "Business Units", href: "/ceo/units", icon: Briefcase },
  { label: "Geography", href: "/ceo/geography", icon: Globe },
  { label: "Strategic KPIs", href: "/ceo/kpis", icon: Target },
  { label: "Risk & Alerts", href: "/ceo/risk", icon: AlertCircle },
];

export const Route = createFileRoute("/_authenticated/ceo")({
  component: () => <Outlet />,
});
