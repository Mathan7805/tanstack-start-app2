import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ceoNav } from "./ceo";

export const Route = createFileRoute("/_authenticated/ceo/kpis")({
  head: () => ({ meta: [{ title: "Strategic KPIs — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={ceoNav}
      eyebrow="CEO Workspace"
      title="Strategic KPIs"
      subtitle="Board-level metrics tracked against annual targets."
      stats={[
        { label: "ARR Growth", value: "18.4%", delta: "Target 15%", accent: "emerald" },
        { label: "Gross Margin", value: "34.9%", delta: "Target 33%" },
        { label: "EBITDA Margin", value: "22.1%", delta: "Target 20%", accent: "gold" },
        { label: "NPS", value: "62", delta: "+4 QoQ" },
      ]}
      sections={[
        {
          title: "On Track",
          items: [
            { name: "Revenue per FTE", meta: "₹0.42M vs target ₹0.40M", tag: "Beat" },
            { name: "Customer Retention", meta: "96.4% logo retention", tag: "Beat" },
          ],
        },
        {
          title: "At Risk",
          items: [
            { name: "DSO", meta: "42 days vs target 38 days", tag: "Behind" },
            { name: "AI Automation %", meta: "31% vs target 40%", tag: "Behind" },
          ],
        },
      ]}
    />
  ),
});
