import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ceoNav } from "./ceo";

export const Route = createFileRoute("/_authenticated/ceo/geography")({
  head: () => ({ meta: [{ title: "Geography — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={ceoNav}
      eyebrow="CEO Workspace"
      title="Geographic Performance"
      subtitle="Revenue, headcount, and seat footprint by region."
      stats={[
        { label: "India", value: "₹412M", delta: "+5.1%", accent: "emerald" },
        { label: "Philippines", value: "₹98M", delta: "+11.2%" },
        { label: "USA", value: "₹54M", delta: "+3.4%", accent: "gold" },
        { label: "EMEA", value: "₹17M", delta: "+8.7%" },
      ]}
      sections={[
        {
          title: "Region Snapshot",
          items: [
            { name: "Bengaluru HQ", meta: "4,200 FTE · 92% seat util", tag: "Healthy" },
            { name: "Manila Center", meta: "1,180 FTE · 88% seat util", tag: "Expanding" },
            { name: "Dallas Hub", meta: "320 FTE · 76% seat util", tag: "Watch" },
          ],
        },
        {
          title: "Geo Alerts",
          items: [
            { name: "EMEA hiring lag", meta: "32 open seats unfilled > 45 days", tag: "Action" },
            { name: "Manila power cost +14%", meta: "Utility variance flagged", tag: "Review" },
          ],
        },
      ]}
    />
  ),
});
