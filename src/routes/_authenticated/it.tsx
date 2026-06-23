import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Server, Monitor, Cloud, HardDrive, Cpu } from "lucide-react";

export const itNav = [
  { label: "Infra Costs", href: "/it", icon: Server },
  { label: "Seat Utilization", href: "/it/seats", icon: Monitor },
  { label: "Software Stack", href: "/it/software", icon: Cloud },
  { label: "Device Mapping", href: "/it/devices", icon: HardDrive },
  { label: "System Health", href: "/it/health", icon: Cpu },
];

export const Route = createFileRoute("/_authenticated/it")({
  component: () => <Outlet />,
});
