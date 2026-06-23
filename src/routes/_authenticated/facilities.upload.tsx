import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { UploadCenter } from "@/components/UploadCenter";
import { facNav } from "./facilities";

export const Route = createFileRoute("/_authenticated/facilities/upload")({
  head: () => ({ meta: [{ title: "Upload Expenses — FInsightZ" }] }),
  component: FacUpload,
});

function FacUpload() {
  return (
    <AppShell nav={facNav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Facilities Workspace"
          title="Upload Expenses"
          subtitle="Upload utility bills, vendor invoices, and maintenance receipts for AI categorization."
        />
        <UploadCenter persona="facilities"
          title="Facilities Expense Upload"
          subtitle="Drop utility bills, maintenance invoices, or facilities expense sheets."
          accept=".xlsx,.xls,.csv,.pdf"
        />
      </div>
    </AppShell>
  );
}
