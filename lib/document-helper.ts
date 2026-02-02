
import { PdfLine } from "./pdf-generator";
import { formatCurrency } from "./data";
import { EligibilityItem, CodingItem, MedicalNecessityItem, FraudRedFlag, PreAuthWorkflowData } from "./types";

export const getDocumentLinesForItem = (
    type: string,
    item: any,
    context: any
): { title: string; lines: PdfLine[] } => {
    const lines: PdfLine[] = [
        { text: `Document type: ${type}` },
        { text: "" },
    ];

    if (type === "Request Item") {
        lines.push({ text: `Label: ${item.label}`, highlight: true });
        lines.push({ text: `Value: ${item.value}`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: "Source: Hospital Admission Records" });
        lines.push({ text: `Patient: ${context.patientName || "On file"}` });
        lines.push({ text: `Admission: ${context.admissionType || "Planned"}` });
    } else if (type === "Eligibility") {
        const eli = item as EligibilityItem;
        lines.push({ text: `Check: ${eli.label}`, highlight: true });
        lines.push({ text: `Status: ${eli.status.toUpperCase()}`, highlight: true });
        lines.push({ text: `Value: ${eli.value}`, highlight: true });
        if (eli.detail) lines.push({ text: `Detail: ${eli.detail}`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: "Source: Insurer Policy Database" });
        lines.push({ text: `Policy Number: ${context.policyNumber || "N/A"}` });
    } else if (type === "Medical Coding") {
        const code = item as CodingItem;
        lines.push({ text: `Coding Type: ${code.type.toUpperCase()}` });
        lines.push({ text: `Code: ${code.code}`, highlight: true });
        lines.push({ text: `Description: ${code.description}`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: "Source: WHO ICD-10 CMS / AMA CPT Directory" });
    } else if (type === "Medical Necessity") {
        const mn = item as MedicalNecessityItem;
        lines.push({ text: `Source: ${mn.source}`, highlight: true });
        lines.push({ text: `Level: ${mn.level}` });
        lines.push({ text: `Finding: ${mn.finding}`, highlight: true });
        lines.push({ text: `Status: ${mn.status.replace("_", " ").toUpperCase()}`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: "Document: Clinical Evidence & Guidelines" });
    } else if (type === "Fraud & Anomaly") {
        const flag = item as FraudRedFlag;
        lines.push({ text: `Category: ${flag.category.toUpperCase()}` });
        lines.push({ text: `Severity: ${flag.severity.toUpperCase()}`, highlight: true });
        lines.push({ text: `Finding: ${flag.description}`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: "Source: TPA Fraud Monitoring Engine" });
    } else if (type === "Query") {
        lines.push({ text: `Context: Official Inquiry`, highlight: true });
        lines.push({ text: `Question: ${item.question || item.value}`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: "Document: TPA CRM / Hospital Communication Log" });
    }

    lines.push({ text: "" });
    lines.push({ text: "--- End of Document Fragment ---" });
    lines.push({ text: "Automated verification complete." });

    return {
        title: item.label || item.code || item.source || item.category || "Document View",
        lines,
    };
};
