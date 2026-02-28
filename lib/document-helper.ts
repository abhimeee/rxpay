
import { PdfLine } from "./pdf-generator";
import { formatCurrency } from "./data";
import { EligibilityItem, CodingItem, MedicalNecessityItem, FraudRedFlag } from "./types";

const divider = (char = "─", width = 52) => char.repeat(width);

export const getDocumentLinesForItem = (
    type: string,
    item: any,
    context: any
): { title: string; lines: PdfLine[] } => {
    const lines: PdfLine[] = [];

    if (type === "Request Item") {
        const isInconsistent = item.status === "inconsistent" || item.status === "flagged";
        const isMissing = item.status === "missing";

        lines.push({ text: divider("═") });
        lines.push({ text: "   HOSPITAL DOCUMENT VERIFICATION RECORD" });
        lines.push({ text: divider("═") });
        lines.push({ text: "" });
        lines.push({ text: `Document:   ${item.label}`, highlight: !isInconsistent && !isMissing, inconsistency: isInconsistent });
        lines.push({ text: `Status:     ${(item.status ?? "submitted").toUpperCase()}`, highlight: !isInconsistent && !isMissing, inconsistency: isInconsistent });
        if (item.value) {
            lines.push({ text: `Value:      ${item.value}`, highlight: !isInconsistent && !isMissing, inconsistency: isInconsistent });
        }
        lines.push({ text: "" });
        if (isInconsistent && item.aiSuggestion) {
            lines.push({ text: divider("─") });
            lines.push({ text: "  ⚠  AI CONSISTENCY CHECK — FINDING", inconsistency: true });
            lines.push({ text: divider("─") });
            lines.push({ text: item.aiSuggestion, inconsistency: true });
            lines.push({ text: divider("─") });
            lines.push({ text: "" });
        }
        if (isMissing) {
            lines.push({ text: "  ✗  DOCUMENT NOT RECEIVED" });
            lines.push({ text: "     Please resubmit with the pre-auth package." });
            lines.push({ text: "" });
        }
        lines.push({ text: divider() });
        lines.push({ text: `Hospital:   ${context.hospitalName || "On file"}` });
        lines.push({ text: `Patient:    ${context.patientName || "On file"}` });
        lines.push({ text: `Policy No:  ${context.policyNumber || "N/A"}` });
        lines.push({ text: `Insurer:    ${context.insurerName || "N/A"}` });
        lines.push({ text: "" });
        lines.push({ text: "Source:     Hospital Medical Records Department" });
        lines.push({ text: "Verified:   RxPay TPA Document Engine v2.1" });
        lines.push({ text: "" });
        if (item.irdaiRef) {
            lines.push({ text: `IRDAI Ref:  ${item.irdaiRef}` });
            lines.push({ text: "" });
        }

    } else if (type === "Eligibility") {
        const eli = item as EligibilityItem;
        const isFail = eli.status === "fail";
        lines.push({ text: divider("═") });
        lines.push({ text: "   ELIGIBILITY VERIFICATION RECORD" });
        lines.push({ text: divider("═") });
        lines.push({ text: "" });
        lines.push({ text: `Check:      ${eli.label}`, highlight: !isFail, inconsistency: isFail });
        lines.push({ text: `Status:     ${eli.status.toUpperCase()}`, highlight: !isFail, inconsistency: isFail });
        lines.push({ text: `Value:      ${eli.value}`, highlight: !isFail, inconsistency: isFail });
        if (eli.detail) lines.push({ text: `Detail:     ${eli.detail}`, highlight: !isFail });
        lines.push({ text: "" });
        lines.push({ text: divider() });
        lines.push({ text: "Source:     Insurer Policy Database" });
        lines.push({ text: `Policy No:  ${context.policyNumber || "N/A"}` });
        lines.push({ text: `Insurer:    ${context.insurerName || "N/A"}` });

    } else if (type === "Medical Coding") {
        const code = item as CodingItem;
        const isMismatch = code.status !== "valid";
        lines.push({ text: divider("═") });
        lines.push({ text: "   MEDICAL CODING VERIFICATION" });
        lines.push({ text: divider("═") });
        lines.push({ text: "" });
        lines.push({ text: `Type:       ${code.type.toUpperCase()}` });
        lines.push({ text: `Code:       ${code.code}`, highlight: !isMismatch, inconsistency: isMismatch });
        lines.push({ text: `Description:`, highlight: !isMismatch, inconsistency: isMismatch });
        lines.push({ text: `            ${code.description}`, highlight: !isMismatch, inconsistency: isMismatch });
        lines.push({ text: `Status:     ${code.status.replace(/_/g, " ").toUpperCase()}`, highlight: !isMismatch, inconsistency: isMismatch });
        lines.push({ text: "" });
        if (code.diagnosisMatch) {
            lines.push({ text: divider() });
            lines.push({ text: "Diagnosis match:", highlight: true });
            lines.push({ text: `  ${code.diagnosisMatch}`, highlight: true });
            lines.push({ text: "" });
        }
        if (code.clinicalContext) {
            lines.push({ text: divider() });
            lines.push({ text: "Clinical context from source doc:", highlight: true });
            lines.push({ text: `  ${code.clinicalContext}`, highlight: true });
            lines.push({ text: "" });
        }
        if (code.suggestion && isMismatch) {
            lines.push({ text: divider() });
            lines.push({ text: "AI Specificity Hint:", inconsistency: true });
            lines.push({ text: `  ${code.suggestion}`, inconsistency: true });
            lines.push({ text: "" });
        }
        lines.push({ text: divider() });
        lines.push({ text: "Source:     WHO ICD-10 / AMA CPT Directory" });
        lines.push({ text: `Procedure:  ${context.procedure || "N/A"}` });

    } else if (type === "Medical Necessity") {
        const mn = item as MedicalNecessityItem;
        const isNotMet = mn.status === "not_met";
        lines.push({ text: divider("═") });
        lines.push({ text: "   MEDICAL NECESSITY EVIDENCE RECORD" });
        lines.push({ text: divider("═") });
        lines.push({ text: "" });
        lines.push({ text: `Source:     ${mn.source}`, highlight: !isNotMet, inconsistency: isNotMet });
        lines.push({ text: `Level:      ${mn.level} — ${["", "IRDAI Guidelines", "Insurer Policy", "Clinical Tool", "Clinical Literature", "Treating Provider"][mn.level] || ""}` });
        lines.push({ text: `Status:     ${mn.status.replace(/_/g, " ").toUpperCase()}`, highlight: !isNotMet, inconsistency: isNotMet });
        lines.push({ text: "" });
        lines.push({ text: divider() });
        lines.push({ text: "Finding:", highlight: true });
        lines.push({ text: `  "${mn.finding}"`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: divider() });
        lines.push({ text: "Document:   Clinical Evidence & Guidelines" });
        lines.push({ text: `Procedure:  ${context.procedure || "N/A"}` });
        lines.push({ text: `Diagnosis:  ${context.diagnosis || "N/A"}` });

    } else if (type === "Fraud & Anomaly") {
        const flag = item as FraudRedFlag;
        const isActive = flag.severity !== "none";
        lines.push({ text: divider("═") });
        lines.push({ text: "   FRAUD MONITORING ENGINE — FLAG RECORD" });
        lines.push({ text: divider("═") });
        lines.push({ text: "" });
        lines.push({ text: `Category:   ${flag.category.toUpperCase()}` });
        lines.push({ text: `Severity:   ${flag.severity.toUpperCase()}`, highlight: !isActive, inconsistency: isActive });
        lines.push({ text: "" });
        lines.push({ text: divider() });
        lines.push({ text: "Finding:", inconsistency: isActive, highlight: !isActive });
        lines.push({ text: `  "${flag.description}"`, inconsistency: isActive, highlight: !isActive });
        lines.push({ text: "" });
        if (flag.providerFraudRate !== undefined) {
            lines.push({ text: `Provider fraud rate: ${flag.providerFraudRate}%` });
        }
        if (flag.patientClaimsCount !== undefined) {
            lines.push({ text: `Patient claims (this year): ${flag.patientClaimsCount}` });
        }
        lines.push({ text: "" });
        lines.push({ text: divider() });
        lines.push({ text: "Source:     TPA Fraud Monitoring Engine v3.4" });
        lines.push({ text: "Model:      Ensemble (XGBoost + rule-based)" });

    } else if (type === "Query") {
        lines.push({ text: divider("═") });
        lines.push({ text: "   TPA QUERY — HOSPITAL COMMUNICATION LOG" });
        lines.push({ text: divider("═") });
        lines.push({ text: "" });
        lines.push({ text: "Type:       Official Inquiry", highlight: true });
        lines.push({ text: `Question:   ${item.question || item.value}`, highlight: true });
        lines.push({ text: "" });
        lines.push({ text: divider() });
        lines.push({ text: "Document:   TPA CRM / Hospital Communication Log" });
        lines.push({ text: "Response:   Awaited (7-day deadline)" });
    }

    lines.push({ text: "" });
    lines.push({ text: divider("─") });
    lines.push({ text: "End of Document Record — RxPay TPA Services" });

    return {
        title: item.label || item.code || item.source || item.category || "Document View",
        lines,
    };
};
