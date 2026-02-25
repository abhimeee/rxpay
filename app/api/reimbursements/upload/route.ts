import { NextResponse } from "next/server";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  DetectDocumentTextCommand,
  GetDocumentTextDetectionCommand,
  StartDocumentTextDetectionCommand,
  TextractClient,
} from "@aws-sdk/client-textract";

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

const getAwsConfig = () => {
  const region = process.env.AWS_REGION?.trim();
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  return { region, bucket };
};

const buildSimpleSummary = (text: string) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 4);

  if (!lines.length) return "No summary available.";

  const summary = lines.slice(0, 3).join(" ").slice(0, 420).trim();
  return summary || "No summary available.";
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isImageForTextract = (mimeType: string) =>
  mimeType === "image/jpeg" || mimeType === "image/png";

const linesFromTextractBlocks = (
  blocks?: Array<{ BlockType?: string; Text?: string }>
) =>
  (blocks || [])
    .filter((block) => block.BlockType === "LINE" && !!block.Text?.trim())
    .map((block) => block.Text!.trim())
    .join("\n")
    .trim();

const extractImageTextWithTextract = async (buffer: Buffer, mimeType: string) => {
  const { region } = getAwsConfig();
  if (!region || !isImageForTextract(mimeType)) return "";

  try {
    const textract = new TextractClient({ region });
    const result = await textract.send(
      new DetectDocumentTextCommand({
        Document: { Bytes: new Uint8Array(buffer) },
      })
    );
    return linesFromTextractBlocks(result.Blocks as Array<{ BlockType?: string; Text?: string }>) || "";
  } catch {
    return "";
  }
};

const extractPdfTextWithTextract = async (buffer: Buffer, fileName: string) => {
  const { region, bucket } = getAwsConfig();
  if (!region || !bucket) {
    console.warn("[reimbursements][pdf-textract] Missing AWS config", {
      hasRegion: Boolean(region),
      hasBucket: Boolean(bucket),
      fileName,
    });
    return "";
  }

  const s3 = new S3Client({ region });
  const textract = new TextractClient({ region });
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `reimbursements/textract-temp/${Date.now()}-${safeName}`;
  console.info("[reimbursements][pdf-textract] Starting extraction", {
    fileName,
    bytes: buffer.length,
    region,
    bucket,
    key,
  });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );
    console.info("[reimbursements][pdf-textract] Uploaded PDF to S3 temp key", {
      fileName,
      key,
    });

    const started = await textract.send(
      new StartDocumentTextDetectionCommand({
        DocumentLocation: {
          S3Object: {
            Bucket: bucket,
            Name: key,
          },
        },
      })
    );

    const jobId = started.JobId;
    if (!jobId) {
      console.warn("[reimbursements][pdf-textract] StartDocumentTextDetection returned no JobId", {
        fileName,
        key,
      });
      return "";
    }
    console.info("[reimbursements][pdf-textract] Textract job started", {
      fileName,
      key,
      jobId,
    });

    let status = "IN_PROGRESS";
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await sleep(1500);
      const polled = await textract.send(
        new GetDocumentTextDetectionCommand({
          JobId: jobId,
          MaxResults: 1000,
        })
      );
      status = polled.JobStatus || "IN_PROGRESS";
      console.info("[reimbursements][pdf-textract] Poll status", {
        fileName,
        jobId,
        attempt: attempt + 1,
        status,
      });
      if (status === "SUCCEEDED") {
        let lines = linesFromTextractBlocks(polled.Blocks as Array<{ BlockType?: string; Text?: string }>);
        let nextToken = polled.NextToken;

        while (nextToken) {
          const page = await textract.send(
            new GetDocumentTextDetectionCommand({
              JobId: jobId,
              MaxResults: 1000,
              NextToken: nextToken,
            })
          );
          const pageLines = linesFromTextractBlocks(page.Blocks as Array<{ BlockType?: string; Text?: string }>);
          lines = [lines, pageLines].filter(Boolean).join("\n").trim();
          nextToken = page.NextToken;
        }

        console.info("[reimbursements][pdf-textract] Extraction succeeded", {
          fileName,
          jobId,
          lineCount: lines ? lines.split("\n").length : 0,
          charCount: lines.length,
        });
        return lines;
      }

      if (status === "FAILED" || status === "PARTIAL_SUCCESS") {
        console.warn("[reimbursements][pdf-textract] Extraction failed", {
          fileName,
          jobId,
          status,
        });
        return "";
      }
    }

    console.warn("[reimbursements][pdf-textract] Extraction timed out waiting for completion", {
      fileName,
      jobId,
      maxAttempts: 20,
    });
    return "";
  } catch (error) {
    console.error("[reimbursements][pdf-textract] Unexpected extraction error", {
      fileName,
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  } finally {
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
      console.info("[reimbursements][pdf-textract] Cleaned up S3 temp key", {
        fileName,
        key,
      });
    } catch (error) {
      console.warn("[reimbursements][pdf-textract] Failed to cleanup S3 temp key", {
        fileName,
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

const analyzeDocument = async (file: File) => {
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
    const textractText = await extractPdfTextWithTextract(buffer, file.name);
    if (textractText) {
      return {
        filename: file.name,
        text: textractText,
        summary: buildSimpleSummary(textractText),
        source,
      } as const;
    }

    return {
      filename: file.name,
      text: "No readable text extracted.",
      summary: "No summary available.",
      source,
    } as const;
  }

  const textractText = await extractImageTextWithTextract(buffer, file.type || "image/jpeg");
  if (textractText) {
    return {
      filename: file.name,
      text: textractText,
      summary: buildSimpleSummary(textractText),
      source,
    } as const;
  }

  return {
    filename: file.name,
    text: "No readable text extracted.",
    summary: "No summary available.",
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
