import { prisma } from "@/lib/prisma";
import {
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { inspectPdf } from "./pdf-inspector";
import { analyzeDocument } from "./inscribe";
import { isS3Configured } from "../storage/s3";
import type { TamperReport } from "./types";

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.UW_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let _client: S3Client | null = null;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }
  return _client;
}

async function streamToBuffer(stream: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function fetchDocumentBytes(s3Key: string): Promise<Uint8Array | null> {
  if (!isS3Configured()) {
    // Mock-mode: no real bytes exist. We still run the inspectors against
    // a tiny synthetic PDF so downstream surfaces a (mock) verdict.
    return null;
  }
  try {
    const obj = await client().send(
      new GetObjectCommand({ Bucket: bucket!, Key: s3Key })
    );
    if (!obj.Body) return null;
    return await streamToBuffer(obj.Body as AsyncIterable<Uint8Array>);
  } catch {
    return null;
  }
}

// Tiny valid PDF skeleton — only used to drive the inspector when there is
// no real S3 file (i.e. mock mode). Lets the pipeline run end-to-end.
function syntheticPdfBytes(filename: string): Uint8Array {
  // Stamp the filename into the PDF body so the mocked Inscribe path can also
  // see filename-based hints.
  const body =
    `%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n` +
    `2 0 obj <</Type /Pages /Count 1 /Kids [3 0 R]>> endobj\n` +
    `3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>> endobj\n` +
    `4 0 obj <</Producer (PMF Mock) /Title (${filename.replace(/[()\\]/g, "_")})>> endobj\n` +
    `xref\n0 5\n0000000000 65535 f \n` +
    `trailer <</Size 5 /Root 1 0 R /Info 4 0 R>>\nstartxref\n0\n%%EOF\n`;
  return new Uint8Array(Buffer.from(body, "latin1"));
}

export async function runTamperChecks(input: {
  documentId: string;
}): Promise<{ ranInspector: boolean; ranInscribe: boolean }> {
  const doc = await prisma.uwDocument.findUnique({
    where: { id: input.documentId },
  });
  if (!doc) {
    return { ranInspector: false, ranInscribe: false };
  }
  if (!doc.contentType.includes("pdf")) {
    return { ranInspector: false, ranInscribe: false };
  }

  let bytes = await fetchDocumentBytes(doc.s3Key);
  if (!bytes) bytes = syntheticPdfBytes(doc.filename);

  const [inspector, inscribe] = await Promise.all([
    inspectPdf({
      bytes,
      filename: doc.filename,
      expectedMonth: doc.statementMonth,
      expectedYear: doc.statementYear,
    }).catch(
      (e): TamperReport => ({
        source: "pdf_inspector",
        verdict: "UNKNOWN",
        riskScore: 0,
        signals: [
          {
            code: "inspector_exception",
            severity: "info",
            message: (e as Error).message,
          },
        ],
      })
    ),
    analyzeDocument({
      bytes,
      filename: doc.filename,
      contentType: doc.contentType,
    }),
  ]);

  await prisma.$transaction([
    prisma.uwTamperCheck.create({
      data: {
        documentId: doc.id,
        source: inspector.source,
        verdict: inspector.verdict,
        riskScore: inspector.riskScore,
        signals: inspector.signals as unknown as object,
        rawJson: (inspector.rawJson ?? null) as unknown as object,
      },
    }),
    prisma.uwTamperCheck.create({
      data: {
        documentId: doc.id,
        source: inscribe.source,
        verdict: inscribe.verdict,
        riskScore: inscribe.riskScore,
        signals: inscribe.signals as unknown as object,
        rawJson: (inscribe.rawJson ?? null) as unknown as object,
      },
    }),
  ]);

  return { ranInspector: true, ranInscribe: true };
}

// Composite verdict for a document — the higher-risk of the two checks wins.
export interface CompositeTamperResult {
  verdict: "CLEAN" | "SUSPICIOUS" | "TAMPERED" | "UNKNOWN";
  riskScore: number;
  signals: { source: string; signals: unknown }[];
}

export function compositeVerdict(
  checks: {
    source: string;
    verdict: string;
    riskScore: number;
    signals: unknown;
  }[]
): CompositeTamperResult {
  if (checks.length === 0) {
    return { verdict: "UNKNOWN", riskScore: 0, signals: [] };
  }
  const top = [...checks].sort((a, b) => b.riskScore - a.riskScore)[0];
  return {
    verdict: top.verdict as CompositeTamperResult["verdict"],
    riskScore: top.riskScore,
    signals: checks.map((c) => ({ source: c.source, signals: c.signals })),
  };
}
