import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { facNav } from "./facilities";

export const Route = createFileRoute("/_authenticated/facilities/utilities")({
  head: () => ({ meta: [{ title: "Utilities — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={facNav}
      eyebrow="Facilities Workspace"
      title="Utilities"
      subtitle="Power, HVAC, and energy spend tracked across sites."
      stats={[
        { label: "Power (kWh)", value: "184K", delta: "-3% MoM", accent: "emerald" },
        { label: "Cost", value: "₹2.1M", delta: "Under budget" },
        { label: "Peak Demand", value: "412 kW", delta: "BLR Tower B", accent: "gold" },
        { label: "Renewable %", value: "34%", delta: "+6 pts YoY" },
      ]}
      sections={[
        {
          title: "Site Consumption",
          items: [
            { name: "Bengaluru HQ", meta: "92K kWh · ₹1.04M", tag: "Stable" },
            { name: "Manila Center", meta: "48K kWh · ₹0.61M", tag: "Stable" },
            { name: "Pune Annex", meta: "22K kWh · ₹0.28M", tag: "Reduce" },
          ],
        },
        {
          title: "Efficiency Projects",
          items: [
            { name: "LED retrofit — Tower A", meta: "12% savings achieved", tag: "Done" },
            { name: "HVAC scheduler v2", meta: "Pilot in 3 floors", tag: "Pilot" },
          ],
        },
      ]}
    />
  ),
});
