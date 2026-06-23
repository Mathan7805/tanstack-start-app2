import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { facNav } from "./facilities";

export const Route = createFileRoute("/_authenticated/facilities/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={facNav}
      eyebrow="Facilities Workspace"
      title="Maintenance"
      subtitle="Preventive maintenance schedule, open tickets, and vendor SLAs."
      stats={[
        { label: "Open Tickets", value: "142", delta: "-18 WoW", accent: "emerald" },
        { label: "PM Compliance", value: "96%", delta: "Target 95%" },
        { label: "MTTR", value: "5.2 hr", delta: "-1.1 hr", accent: "gold" },
        { label: "Vendor SLA", value: "92%", delta: "Met 30d avg" },
      ]}
      sections={[
        {
          title: "High Priority",
          items: [
            { name: "BLR Tower A · DG-2 service", meta: "Due in 6 days", tag: "Sched" },
            { name: "Manila chiller leak", meta: "Vendor on-site", tag: "P2" },
          ],
        },
        {
          title: "Closed This Week",
          items: [
            { name: "Pune UPS battery swap", meta: "Closed · 3 days early", tag: "Done" },
            { name: "Cafeteria deep clean", meta: "Vendor signed off", tag: "Done" },
          ],
        },
      ]}
    />
  ),
});
