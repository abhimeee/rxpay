
/**
 * Utility for generating dummy PDF Data URIs for demo purposes.
 */

export type PdfLine = {
    text: string;
    highlight?: boolean;      // verified/extracted field → green tint
    inconsistency?: boolean;  // AI-flagged issue → yellow highlight
};

const padPdfOffset = (offset: number) => String(offset).padStart(10, "0");

const escapePdfText = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const encodeBase64 = (value: string) => {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
    }
    return btoa(binary);
};

export const buildDummyPdfDataUri = (lines: PdfLine[]) => {
    const contentParts: string[] = [];

    // Header drawing logic
    if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.highlight) {
            // Draw yellow rectangle for highlight
            contentParts.push("1.0 1.0 0.0 rg"); // Yellow fill color
            contentParts.push(`70 735 472 25 re`, "f");
            contentParts.push("0.0 0.0 0.0 rg"); // Back to black
        }
        contentParts.push("BT", "/F1 18 Tf", "72 740 Td", `(${escapePdfText(firstLine.text)}) Tj`, "ET");
    }

    if (lines.length > 1) {
        const secondLine = lines[1];
        if (secondLine.highlight) {
            contentParts.push("1.0 1.0 0.0 rg");
            contentParts.push(`70 714 472 18 re`, "f");
            contentParts.push("0.0 0.0 0.0 rg");
        }
        contentParts.push("BT", "/F1 12 Tf", "72 718 Td", `(${escapePdfText(secondLine.text)}) Tj`, "ET");
    }

    let currentY = 718;
    for (let i = 2; i < lines.length; i += 1) {
        currentY -= 14;
        const line = lines[i];
        if (line.highlight && line.text.trim()) {
            contentParts.push("1.0 1.0 0.0 rg");
            contentParts.push(`70 ${currentY - 3} 472 13 re`, "f");
            contentParts.push("0.0 0.0 0.0 rg");
        }
        contentParts.push("BT", "/F1 10 Tf", `72 ${currentY} Td`, `(${escapePdfText(line.text)}) Tj`, "ET");
    }

    const content = contentParts.join("\n");
    const objects = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
        `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ];
    let offset = "%PDF-1.4\n".length;
    const offsets = objects.map((obj) => {
        const current = offset;
        offset += obj.length;
        return current;
    });
    const xrefOffset = offset;
    const xref = [
        "xref",
        `0 ${objects.length + 1}`,
        "0000000000 65535 f ",
        ...offsets.map((o) => `${padPdfOffset(o)} 00000 n `),
        "trailer",
        `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
        "startxref",
        String(xrefOffset),
        "%%EOF",
    ].join("\n");
    const pdf = `%PDF-1.4\n${objects.join("")}${xref}`;
    return `data:application/pdf;base64,${encodeBase64(pdf)}`;
};
