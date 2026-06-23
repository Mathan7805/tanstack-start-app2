import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { opsNav } from "./operations";

export const Route = createFileRoute("/_authenticated/operations/sla")({
  head: () => ({ meta: [{ title: "SLA & KPIs — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={opsNav}
      eyebrow="Operations Workspace"
      title="SLA & KPIs"
      subtitle="Contractual SLAs and operational KPIs tracked against thresholds."
      stats={[
        { label: "SLA Met", value: "94.2%", delta: "Target 92%", accent: "emerald" },
        { label: "CSAT", value: "4.31 / 5", delta: "+0.08 MoM" },
        { label: "AHT", value: "342s", delta: "-12s MoM", accent: "gold" },
        { label: "FCR", value: "78%", delta: "Target 75%" },
      ]}
      sections={[
        {
          title: "Top Performing Programs",
          items: [
            { name: "Acme — Tier 1", meta: "97% SLA · CSAT 4.6", tag: "Exceed" },
            { name: "GlobalTel — Voice", meta: "95% SLA · AHT 298s", tag: "Beat" },
          ],
        },
        {
          title: "SLA Breaches",
          items: [
            { name: "FinBank — Collections", meta: "88% vs 92% target", tag: "Breach" },
            { name: "Retail Co — Chat", meta: "AHT exceeds by 18%", tag: "Watch" },
          ],
        },
      ]}
    />
  ),
});
