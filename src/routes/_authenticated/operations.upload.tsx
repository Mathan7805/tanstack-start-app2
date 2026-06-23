import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { UploadCenter } from "@/components/UploadCenter";
import { opsNav } from "./operations";

export const Route = createFileRoute("/_authenticated/operations/upload")({
  head: () => ({ meta: [{ title: "Upload Center — FInsightZ" }] }),
  component: OpsUpload,
});

function OpsUpload() {
  return (
    <AppShell nav={opsNav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Operations Workspace"
          title="Upload Center"
          subtitle="Push process metrics, headcount sheets, and SLA reports for AI extraction."
        />
        <UploadCenter persona="operations"
          title="Operations Data Upload"
          subtitle="Drop Excel/CSV files containing process metrics, headcount, or SLA data."
          accept=".xlsx,.xls,.csv"
        />
      </div>
    </AppShell>
  );
}
