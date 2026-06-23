import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { itNav } from "./it";

export const Route = createFileRoute("/_authenticated/it/devices")({
  head: () => ({ meta: [{ title: "Device Mapping — FInsightZ" }] }),
  component: () => (
    <StubPage
      nav={itNav}
      eyebrow="IT Workspace"
      title="Device Mapping"
      subtitle="Endpoint inventory linked to FTE assignments and cost centers."
      stats={[
        { label: "Total Devices", value: "9,128", delta: "+142 MoM", accent: "emerald" },
        { label: "Unassigned", value: "186", delta: "Aging > 14d" },
        { label: "EOL Within 90d", value: "412", delta: "Refresh queue", accent: "gold" },
        { label: "Compliance", value: "98.4%", delta: "MDM enrolled" },
      ]}
      sections={[
        {
          title: "Inventory by Class",
          items: [
            { name: "Laptops", meta: "6,820 · avg age 2.4 yr", tag: "Healthy" },
            { name: "Thin Clients", meta: "1,940 · BLR + Manila", tag: "Stable" },
            { name: "Mobile Devices", meta: "368 · field ops", tag: "MDM" },
          ],
        },
        {
          title: "Pending Refresh",
          items: [
            { name: "Dell Latitude 5410", meta: "182 units · EOL Mar 2026", tag: "Order" },
            { name: "HP Elite 840 G6", meta: "230 units · EOL Apr 2026", tag: "Order" },
          ],
        },
      ]}
    />
  ),
});
