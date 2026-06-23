import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Building2, Zap, Droplets, Wrench, Upload } from "lucide-react";

export const facNav = [
  { label: "Buildings", href: "/facilities", icon: Building2 },
  { label: "Utilities", href: "/facilities/utilities", icon: Zap },
  { label: "Water & Waste", href: "/facilities/water", icon: Droplets },
  { label: "Maintenance", href: "/facilities/maintenance", icon: Wrench },
  { label: "Upload Expenses", href: "/facilities/upload", icon: Upload },
];

export const Route = createFileRoute("/_authenticated/facilities")({
  component: () => <Outlet />,
});
