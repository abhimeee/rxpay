import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPreAuth,
  getHospital,
  getInsurer,
  getPolicyHolder,
  getAssignee,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPreAuthKey,
  getSimulatedAnalysisResult,
} from "@/lib/data";
import { getWorkflowData } from "@/lib/workflow-data";
import { PreAuthDetailClient } from "./PreAuthDetailClient";

export default async function PreAuthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pa = getPreAuth(id);
  if (!pa) notFound();

  const hospital = getHospital(pa.hospitalId);
  const insurer = getInsurer(pa.insurerId);
  const holder = getPolicyHolder(pa.policyHolderId);
  const assignee = (pa.assigneeId ? getAssignee(pa.assigneeId) : null) ?? null;
  const simulatedResult = getSimulatedAnalysisResult(pa.id);
  const workflowData = getWorkflowData(pa.id) ?? undefined;

  return (
    <PreAuthDetailClient
      pa={pa}
      hospital={hospital}
      insurer={insurer}
      holder={holder}
      assignee={assignee}
      simulatedResult={simulatedResult}
      workflowData={workflowData}
    />
  );
}
