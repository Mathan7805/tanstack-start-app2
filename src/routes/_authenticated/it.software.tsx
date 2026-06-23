import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { itNav } from "./it";

export const Route = createFileRoute("/_authenticated/it/software")({
  head: () => ({ meta: [{ title: "Software Stack — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={itNav}
      eyebrow="IT Workspace"
      title="Software Stack"
      subtitle="License inventory, SaaS spend, and renewal calendar."
      stats={[
        { label: "Active Licenses", value: "8,420", delta: "82% assigned", accent: "emerald" },
        { label: "Annual SaaS", value: "₹64M", delta: "-3% vs budget" },
        { label: "Renewals 90d", value: "12", delta: "₹14M exposure", accent: "gold" },
        { label: "Shadow IT", value: "27 apps", delta: "Discovery scan" },
      ]}
      sections={[
        {
          title: "Top Vendors by Spend",
          items: [
            { name: "Microsoft 365 E5", meta: "5,200 seats · renewal Mar", tag: "Strategic" },
            { name: "Salesforce", meta: "₹11M ARR · auto-renew", tag: "Lock-in" },
            { name: "ServiceNow", meta: "₹6.4M ARR · expansion", tag: "Growth" },
          ],
        },
        {
          title: "Optimization Opportunities",
          items: [
            { name: "Zoom dormant seats", meta: "318 inactive > 60 days", tag: "Reclaim" },
            { name: "Adobe Creative", meta: "Move 40 seats to shared", tag: "Save ₹2M" },
          ],
        },
      ]}
    />
  ),
});
