import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ceoNav } from "./ceo";

export const Route = createFileRoute("/_authenticated/ceo/units")({
  head: () => ({ meta: [{ title: "Business Units — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={ceoNav}
      eyebrow="CEO Workspace"
      title="Business Units"
      subtitle="P&L performance by business line, with margin and growth signals."
      stats={[
        { label: "BPO Services", value: "₹312M", delta: "+6.2% MoM", accent: "emerald" },
        { label: "Tech Support", value: "₹148M", delta: "+9.1%" },
        { label: "Collections", value: "₹78M", delta: "-1.4%", accent: "gold" },
        { label: "Consulting", value: "₹43M", delta: "+12.0%" },
      ]}
      sections={[
        {
          title: "Top Performing Units",
          items: [
            { name: "Tech Support — APAC", meta: "Margin 41% · ₹84M revenue", tag: "Leader" },
            { name: "BPO — Voice Ops", meta: "Margin 28% · ₹196M revenue", tag: "Stable" },
            { name: "Consulting Practice", meta: "Margin 38% · ₹43M revenue", tag: "Growth" },
          ],
        },
        {
          title: "Units Needing Attention",
          items: [
            { name: "Collections — North", meta: "Margin slipped to 14%", tag: "Watch" },
            { name: "Chat Support", meta: "FTE cost up 8% MoM", tag: "Review" },
          ],
        },
      ]}
    />
  ),
});
