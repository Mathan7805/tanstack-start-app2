import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { facNav } from "./facilities";

export const Route = createFileRoute("/_authenticated/facilities/water")({
  head: () => ({ meta: [{ title: "Water & Waste — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={facNav}
      eyebrow="Facilities Workspace"
      title="Water & Waste"
      subtitle="Consumption, recycling, and ESG-tracked waste metrics."
      stats={[
        { label: "Water (KL)", value: "12.4K", delta: "-4% MoM", accent: "emerald" },
        { label: "Recycled %", value: "62%", delta: "+5 pts" },
        { label: "Waste (T)", value: "84", delta: "Sorted on-site", accent: "gold" },
        { label: "Diversion", value: "78%", delta: "Target 80%" },
      ]}
      sections={[
        {
          title: "Site Highlights",
          items: [
            { name: "BLR — Rainwater harvest", meta: "1.2KL/day captured", tag: "Active" },
            { name: "Manila — STP plant", meta: "94% reuse for landscape", tag: "Active" },
          ],
        },
        {
          title: "Open Actions",
          items: [
            { name: "Composter for Tower C", meta: "Vendor RFQ in progress", tag: "RFQ" },
            { name: "E-waste pickup", meta: "Quarterly · scheduled Dec", tag: "Sched" },
          ],
        },
      ]}
    />
  ),
});
