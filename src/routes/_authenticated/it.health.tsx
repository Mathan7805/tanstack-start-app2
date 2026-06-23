import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { itNav } from "./it";

export const Route = createFileRoute("/_authenticated/it/health")({
  head: () => ({ meta: [{ title: "System Health — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={itNav}
      eyebrow="IT Workspace"
      title="System Health"
      subtitle="Uptime, incident posture, and capacity headroom across core platforms."
      stats={[
        { label: "Uptime (30d)", value: "99.94%", delta: "Above SLA", accent: "emerald" },
        { label: "Open Incidents", value: "6", delta: "1 P1 active", accent: "gold" },
        { label: "MTTR", value: "38 min", delta: "-12 min QoQ" },
        { label: "Change Success", value: "97.2%", delta: "Past 30d" },
      ]}
      sections={[
        {
          title: "Active Incidents",
          items: [
            { name: "Voice gateway latency", meta: "Manila region · P1 · 14m", tag: "P1" },
            { name: "Payroll API timeouts", meta: "Intermittent · P3", tag: "P3" },
          ],
        },
        {
          title: "Capacity Watch",
          items: [
            { name: "CRM DB storage", meta: "78% used · grow trigger 80%", tag: "Plan" },
            { name: "BLR egress", meta: "Peak 84% of 10G link", tag: "Watch" },
          ],
        },
      ]}
    />
  ),
});
