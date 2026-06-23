import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { opsNav } from "./operations";

export const Route = createFileRoute("/_authenticated/operations/headcount")({
  head: () => ({ meta: [{ title: "Headcount — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={opsNav}
      eyebrow="Operations Workspace"
      title="Headcount"
      subtitle="FTE counts, attrition, and hiring pipeline by process."
      stats={[
        { label: "Active FTE", value: "8,142", delta: "+62 MoM", accent: "emerald" },
        { label: "Attrition (TTM)", value: "18.4%", delta: "-1.2 pts" },
        { label: "Open Roles", value: "284", delta: "32% > 30d", accent: "gold" },
        { label: "Trainees", value: "412", delta: "Class of Nov" },
      ]}
      sections={[
        {
          title: "Hiring Pipeline",
          items: [
            { name: "Voice Ops — BLR", meta: "120 offers extended", tag: "Active" },
            { name: "Tech Support — Manila", meta: "60 in screening", tag: "Active" },
            { name: "Collections — Pune", meta: "40 in assessment", tag: "Active" },
          ],
        },
        {
          title: "Attrition Hotspots",
          items: [
            { name: "Chat Support", meta: "26% TTM · exit interviews flagged", tag: "Review" },
            { name: "Voice — Night Shift", meta: "22% TTM · retention plan", tag: "Review" },
          ],
        },
      ]}
    />
  ),
});
