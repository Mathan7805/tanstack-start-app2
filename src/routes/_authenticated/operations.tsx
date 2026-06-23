import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Activity, Users, Wallet, TrendingUp, Upload } from "lucide-react";

export const opsNav = [
  { label: "Unit Economics", href: "/operations", icon: Activity },
  { label: "Cost per FTE", href: "/operations/headcount", icon: Users },
  { label: "Process P&L", href: "/operations/performance", icon: TrendingUp },
  { label: "Cost Allocation", href: "/operations/sla", icon: Wallet },
  { label: "Upload Center", href: "/operations/upload", icon: Upload },
];

export const Route = createFileRoute("/_authenticated/operations")({
  component: () => <Outlet />,
});
