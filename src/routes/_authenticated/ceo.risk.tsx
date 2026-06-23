import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ceoNav } from "./ceo";

export const Route = createFileRoute("/_authenticated/ceo/risk")({
  head: () => ({ meta: [{ title: "Risk & Alerts — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={ceoNav}
      eyebrow="CEO Workspace"
      title="Risk & Alerts"
      subtitle="Material risks surfaced by AI watch, finance controls, and operations sensors."
      stats={[
        { label: "Critical", value: "3", delta: "Needs CEO action", accent: "gold" },
        { label: "High", value: "8", delta: "Owner assigned" },
        { label: "Medium", value: "21", delta: "Trending down", accent: "emerald" },
        { label: "Open > 30d", value: "5", delta: "SLA breach" },
      ]}
      sections={[
        {
          title: "Critical Alerts",
          items: [
            { name: "Vendor concentration > 30%", meta: "Top 3 vendors · supply risk", tag: "Critical" },
            { name: "Forex exposure unhedged", meta: "USD 4.2M @ open position", tag: "Critical" },
            { name: "Data residency drift", meta: "EMEA workload in APAC region", tag: "Critical" },
          ],
        },
        {
          title: "Recent Resolutions",
          items: [
            { name: "GST audit closed", meta: "FY24 Q3 · clean opinion", tag: "Closed" },
            { name: "SOC2 finding cleared", meta: "Access review remediated", tag: "Closed" },
          ],
        },
      ]}
    />
  ),
});
