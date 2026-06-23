import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { itNav } from "./it";

export const Route = createFileRoute("/_authenticated/it/seats")({
  head: () => ({ meta: [{ title: "Seat Utilization — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={itNav}
      eyebrow="IT Workspace"
      title="Seat Utilization"
      subtitle="Workstation and license utilization by site and shift."
      stats={[
        { label: "Avg Util", value: "87%", delta: "+4 pts MoM", accent: "emerald" },
        { label: "Idle Seats", value: "412", delta: "-58 MoM" },
        { label: "Overbooked", value: "9 sites", delta: "Action", accent: "gold" },
        { label: "Shift Coverage", value: "3.2", delta: "shifts/seat/day" },
      ]}
      sections={[
        {
          title: "High Utilization",
          items: [
            { name: "BLR — Tower B", meta: "94% · night shift saturated", tag: "Hot" },
            { name: "Manila — Floor 4", meta: "91% · weekend overflow", tag: "Hot" },
          ],
        },
        {
          title: "Underutilized",
          items: [
            { name: "Pune — Annex", meta: "62% · candidate to consolidate", tag: "Review" },
            { name: "Dallas — Wing C", meta: "58% · remote workforce", tag: "Review" },
          ],
        },
      ]}
    />
  ),
});
