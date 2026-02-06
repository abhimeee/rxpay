import { NextResponse } from "next/server";

const getSource = (file: File) => {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "unsupported";
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getAnthropicConfig = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-20241022";
  return { apiKey, model };
};

const parseJsonPayload = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as { transcript?: string; summary?: string };
  } catch {
    return null;
  }
};

const callAnthropic = async (payload: Record<string, unknown>) => {
  const { apiKey } = getAnthropicConfig();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Anthropic request failed.");
  }

  return (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
};

const buildTextPrompt = (text: string) => `
You are an expert claims intake analyst. Return a strict JSON object with keys:
- "transcript": cleaned, readable text from the document
- "summary": 2-4 concise sentences that highlight the key medical, billing, and policy-relevant details

If the document has no readable text, set transcript to "No readable text extracted." and summary to "No summary available."

Document text:
${text}
`;

const buildVisionPrompt = () => `
You are an expert claims intake analyst. Extract the readable text from this medical document image, then summarize it.
Return a strict JSON object with keys:
- "transcript": the extracted text
- "summary": 2-4 concise sentences highlighting key medical, billing, and policy-relevant details

If no readable text is present, set transcript to "No readable text extracted." and summary to "No summary available."
`;

const analyzeDocument = async (file: File) => {
  const { model } = getAnthropicConfig();
  const source = getSource(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (source === "unsupported") {
    return {
      filename: file.name,
      text: "No OCR available for this file type.",
      summary: "No summary available.",
      source,
    } as const;
  }

  if (source === "pdf") {
    // Use Anthropic's native PDF support via document source
    const payload = {
      model,
      max_tokens: 1024,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: buffer.toString("base64"),
              },
            },
            {
              type: "text",
              text: buildTextPrompt("Please extract and summarize the document above."),
            },
          ],
        },
      ],
    };

    const result = await callAnthropic(payload);
    const text = result.content?.find((item) => item.type === "text")?.text ?? "";
    const parsedJson = parseJsonPayload(text);

    return {
      filename: file.name,
      text: parsedJson?.transcript || "No readable text extracted.",
      summary: parsedJson?.summary || "No summary available.",
      source,
    } as const;
  }

  const payload = {
    model,
    max_tokens: 800,
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: file.type || "image/jpeg",
              data: buffer.toString("base64"),
            },
          },
          {
            type: "text",
            text: buildVisionPrompt(),
          },
        ],
      },
    ],
  };

  const result = await callAnthropic(payload);
  const text = result.content?.find((item) => item.type === "text")?.text ?? "";
  const parsedJson = parseJsonPayload(text);

  return {
    filename: file.name,
    text: parsedJson?.transcript || "No readable text extracted.",
    summary: parsedJson?.summary || "No summary available.",
    source,
  } as const;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const claimId = String(formData.get("claimId") ?? "").trim();
    const policyNumber = String(formData.get("policyNumber") ?? "").trim();
    const memberName = String(formData.get("memberName") ?? "").trim();
    const hospitalName = String(formData.get("hospitalName") ?? "").trim();
    const amount = String(formData.get("amount") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No files were provided for upload." },
        { status: 400 }
      );
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const timestamp = Date.now();
    const uploads = files.map((file, index) => ({
      key: `reimbursements/${claimId || "claim"}-${timestamp}-${index}-${file.name}`,
      filename: file.name,
      size: file.size,
    }));

    const transcriptions = await Promise.all(files.map((file) => analyzeDocument(file)));

    const summaryParts = [
      claimId && `Claim ${claimId}`,
      policyNumber && `Policy ${policyNumber}`,
      memberName && `Member ${memberName}`,
      hospitalName && `Hospital ${hospitalName}`,
      amount && `Amount ${amount}`,
      `${files.length} file${files.length === 1 ? "" : "s"} (${formatBytes(totalBytes)})`,
      notes && `Notes: ${notes}`,
    ].filter(Boolean);

    const aiSummary = transcriptions.some((item) => item.summary !== "No summary available.")
      ? transcriptions.map((item) => `• ${item.filename}: ${item.summary}`).join("\n")
      : summaryParts.join(" | ");

    return NextResponse.json({
      ok: true,
      bucket: process.env.AWS_S3_BUCKET || "local-mock",
      uploads,
      transcriptions,
      summary: aiSummary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
