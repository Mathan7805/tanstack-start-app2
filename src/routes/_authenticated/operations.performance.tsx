import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { opsNav } from "./operations";

export const Route = createFileRoute("/_authenticated/operations/performance")({
  head: () => ({ meta: [{ title: "Performance — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={opsNav}
      eyebrow="Operations Workspace"
      title="Performance"
      subtitle="Agent productivity, quality scores, and coaching pipeline."
      stats={[
        { label: "Productivity Index", value: "112", delta: "vs baseline 100", accent: "emerald" },
        { label: "Quality Score", value: "91.4%", delta: "+1.6 pts" },
        { label: "Coaching Hours", value: "1,820", delta: "MoM", accent: "gold" },
        { label: "Top Quartile", value: "23%", delta: "of workforce" },
      ]}
      sections={[
        {
          title: "Top Performers",
          items: [
            { name: "Team Phoenix (Voice)", meta: "Productivity 128 · QA 96%", tag: "Top 5%" },
            { name: "Team Atlas (Chat)", meta: "Productivity 121 · QA 94%", tag: "Top 5%" },
          ],
        },
        {
          title: "Coaching Pipeline",
          items: [
            { name: "Bottom Quartile (Voice)", meta: "82 agents · 8-week plan", tag: "Active" },
            { name: "New Hires — Class 19", meta: "120 agents · nesting", tag: "Onboarding" },
          ],
        },
      ]}
    />
  ),
});
