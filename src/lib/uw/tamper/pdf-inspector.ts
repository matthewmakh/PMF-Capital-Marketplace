import { PDFDocument } from "pdf-lib";
import type { TamperReport, TamperSignal } from "./types";
import { scoreFromSignals, verdictFromScore } from "./types";

// Producers / Creators that real banks use when they generate statement PDFs.
// Substrings matched case-insensitively.
const KNOWN_BANK_PRODUCERS = [
  "aci document production",
  "aci worldwide",
  "appworx",
  "fiserv",
  "fis ",
  "jack henry",
  "ncr ",
  "novarica",
  "pace document",
  "powerpdf",
  "adobe livecycle",
  "ibm filenet",
  "openforms",
  "thunderhead",
  "objectif lune",
  "doc1",
  "designer 6",
  "designer 7",
  "designer 8",
  "designer 9",
  "designer 11",
  "designer 12",
  "elixir",
  "exstream",
  "engagement on",
  "csi ",
  "chase ",
  "wells fargo",
  "bank of america",
  "capital one",
  "us bank ",
  "tdbank",
  "pnc bank",
  "regions bank",
  "citizens bank",
  "fifth third",
  "huntington",
  "santander",
  "key bank",
  "bbva",
  "ally bank",
  "td auto",
  "navy federal",
  "usaa ",
  "schwab",
  "fidelity ",
  "ascendant",
];

// Producers / Creators that strongly suggest a human re-exported the PDF.
const SUSPICIOUS_PRODUCERS = [
  "microsoft word",
  "microsoft excel",
  "microsoft powerpoint",
  "google docs",
  "google sheets",
  "libreoffice",
  "openoffice",
  "pages",
  "numbers",
  "photoshop",
  "illustrator",
  "indesign",
  "gimp",
  "paint",
  "preview",     // macOS Preview re-saves are common with tampering
  "skim",
  "foxit phantom",
  "foxit reader",
  "nitro pro",
  "nitro pdf",
  "pdfescape",
  "pdf24",
  "smallpdf",
  "ilovepdf",
  "sejda",
  "soda pdf",
  "wondershare",
  "pdfelement",
  "pdf candy",
  "deftpdf",
  "icecream pdf",
  "primopdf",
  "cutepdf",
  "doxie",
  "scanbot",
  "camscanner",
  "scannable",
  "tinyscanner",
];

const matchAny = (text: string, patterns: string[]): string | null => {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const p of patterns) {
    if (lower.includes(p)) return p;
  }
  return null;
};

function parsePdfDate(d: string | undefined): Date | null {
  // PDF dates look like: D:YYYYMMDDHHmmSS[+-]HH'mm'
  if (!d) return null;
  const m = /^D?:?(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/.exec(d);
  if (!m) return null;
  const [, y, mo, da, h = "0", mi = "0", se = "0"] = m;
  const date = new Date(
    Date.UTC(
      parseInt(y),
      parseInt(mo) - 1,
      parseInt(da),
      parseInt(h),
      parseInt(mi),
      parseInt(se)
    )
  );
  return isNaN(date.getTime()) ? null : date;
}

// pdf-lib forcibly overrides `Producer` and `ModDate` on read, so we extract
// raw Info-dict fields directly from the PDF bytes. Both literal-string
// `(value)` and hex-string `<48656c6c6f>` forms are supported.
function readPdfLiteralString(s: string): string {
  // Handle escapes \(, \), \\, octal escapes are best-effort decoded.
  return s
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\([0-7]{1,3})/g, (_, oct: string) =>
      String.fromCharCode(parseInt(oct, 8))
    );
}

function readPdfHexString(hex: string): string {
  const cleaned = hex.replace(/\s/g, "");
  const padded = cleaned.length % 2 ? cleaned + "0" : cleaned;
  // Strip optional UTF-16 BE BOM (FEFF).
  let stripped = padded;
  if (padded.toLowerCase().startsWith("feff")) stripped = padded.slice(4);
  let out = "";
  for (let i = 0; i < stripped.length; i += 2) {
    const code = parseInt(stripped.substr(i, 2), 16);
    if (Number.isFinite(code)) out += String.fromCharCode(code);
  }
  return out;
}

function extractInfoField(
  ascii: string,
  field: string
): { value: string; found: boolean } {
  // Match `/Key (literal)` allowing escaped parens, OR `/Key <hex>`.
  const literalRe = new RegExp(
    `\\/${field}\\s*\\(((?:[^()\\\\]|\\\\.|\\([^()]*\\))*)\\)`
  );
  const hexRe = new RegExp(`\\/${field}\\s*<([0-9A-Fa-f\\s]*)>`);
  const lit = literalRe.exec(ascii);
  if (lit) return { value: readPdfLiteralString(lit[1]), found: true };
  const hex = hexRe.exec(ascii);
  if (hex) return { value: readPdfHexString(hex[1]), found: true };
  return { value: "", found: false };
}

// Multiple Info-dict entries for the same key in the raw bytes hint at
// splicing / re-export. We match only the PDF cross-reference entries —
// `/Producer (...)` or `/Producer<...>` — so that XMP metadata streams
// (which contain `<pdf:Producer>...</pdf:Producer>`) don't false-positive.
const PRODUCER_RE = /\/Producer\s*[(<]/g;
const CREATOR_RE = /\/Creator\s*[(<]/g;

function countMatches(haystack: string, re: RegExp): number {
  return (haystack.match(re) ?? []).length;
}

export async function inspectPdf(input: {
  bytes: Uint8Array;
  filename: string;
  expectedMonth?: number | null;
  expectedYear?: number | null;
}): Promise<TamperReport> {
  const signals: TamperSignal[] = [];

  // ===== High-level PDF parse =====
  let pdf: PDFDocument;
  try {
    pdf = await PDFDocument.load(input.bytes, { throwOnInvalidObject: false });
  } catch (e) {
    signals.push({
      code: "pdf_unreadable",
      severity: "high",
      message: "PDF could not be parsed",
      detail: (e as Error).message,
    });
    return {
      source: "pdf_inspector",
      verdict: "SUSPICIOUS",
      riskScore: scoreFromSignals(signals),
      signals,
    };
  }

  // pdf-lib forcibly rewrites Producer and ModDate during read — we have to
  // pull these from the raw PDF bytes to see what the file actually claims.
  const ascii = Buffer.from(input.bytes).toString("latin1");
  const producerRaw = extractInfoField(ascii, "Producer");
  const creatorRaw = extractInfoField(ascii, "Creator");
  const authorRaw = extractInfoField(ascii, "Author");
  const titleRaw = extractInfoField(ascii, "Title");
  const subjectRaw = extractInfoField(ascii, "Subject");
  const creationRaw = extractInfoField(ascii, "CreationDate");
  const modRaw = extractInfoField(ascii, "ModDate");

  const producer = producerRaw.found ? producerRaw.value : undefined;
  const creator = creatorRaw.found ? creatorRaw.value : undefined;
  const author = authorRaw.found ? authorRaw.value : undefined;
  const title = titleRaw.found ? titleRaw.value : undefined;
  const subject = subjectRaw.found ? subjectRaw.value : undefined;
  const creationDate = creationRaw.found ? parsePdfDate(creationRaw.value) : null;
  const modDate = modRaw.found ? parsePdfDate(modRaw.value) : null;
  const pageCount = pdf.getPageCount();

  // ===== Producer / Creator checks =====
  const bankMatch =
    matchAny(producer ?? "", KNOWN_BANK_PRODUCERS) ||
    matchAny(creator ?? "", KNOWN_BANK_PRODUCERS);
  const suspiciousMatch =
    matchAny(producer ?? "", SUSPICIOUS_PRODUCERS) ||
    matchAny(creator ?? "", SUSPICIOUS_PRODUCERS);

  if (suspiciousMatch) {
    signals.push({
      code: "producer_suspicious",
      severity: "high",
      message: `Produced/edited by software typically used to alter documents`,
      detail: `Matched "${suspiciousMatch}" in Producer="${producer ?? ""}" / Creator="${creator ?? ""}"`,
    });
  } else if (!bankMatch) {
    if (!producer && !creator) {
      signals.push({
        code: "producer_missing",
        severity: "med",
        message: "PDF has no Producer or Creator metadata",
      });
    } else {
      signals.push({
        code: "producer_unknown",
        severity: "low",
        message: "PDF producer is not a known bank statement generator",
        detail: `Producer="${producer ?? ""}", Creator="${creator ?? ""}"`,
      });
    }
  }

  // ===== Author / Title plausibility =====
  if (author && author.trim().length > 0) {
    signals.push({
      code: "author_present",
      severity: "low",
      message: "PDF has an Author field set — banks rarely include one",
      detail: `Author="${author}"`,
    });
  }
  if (title && /\.(docx?|xlsx?|pages|numbers|odt)/i.test(title)) {
    signals.push({
      code: "title_office_extension",
      severity: "high",
      message: "Title references an Office/word-processor file",
      detail: `Title="${title}"`,
    });
  }

  // ===== Date sanity =====
  if (modDate && creationDate) {
    const deltaMs = modDate.getTime() - creationDate.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (deltaMs > 7 * oneDay) {
      signals.push({
        code: "modified_after_creation",
        severity: "high",
        message: "PDF was modified more than 7 days after creation",
        detail: `Created ${creationDate.toISOString()}, modified ${modDate.toISOString()}`,
      });
    } else if (deltaMs > oneDay) {
      signals.push({
        code: "modified_after_creation_minor",
        severity: "med",
        message: "PDF was modified after creation",
        detail: `Created ${creationDate.toISOString()}, modified ${modDate.toISOString()}`,
      });
    }
  }
  if (!creationDate) {
    signals.push({
      code: "creation_date_missing",
      severity: "low",
      message: "PDF has no creation date",
    });
  }

  // ===== Statement period vs claimed month/year =====
  if (
    input.expectedYear &&
    input.expectedMonth &&
    creationDate &&
    !isNaN(creationDate.getTime())
  ) {
    const created = creationDate;
    const claimed = new Date(
      Date.UTC(input.expectedYear, input.expectedMonth - 1, 1)
    );
    const monthsAfter =
      (created.getUTCFullYear() - claimed.getUTCFullYear()) * 12 +
      (created.getUTCMonth() - claimed.getUTCMonth());
    if (monthsAfter < 0 || monthsAfter > 6) {
      signals.push({
        code: "period_mismatch",
        severity: "med",
        message:
          "Statement was created in a month that does not match its claimed period",
        detail: `Claimed ${input.expectedYear}-${String(input.expectedMonth).padStart(2, "0")}, created ${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, "0")}`,
      });
    }
  }

  // ===== Page count vs typical bank statement =====
  if (pageCount === 0) {
    signals.push({
      code: "no_pages",
      severity: "critical",
      message: "PDF has zero pages",
    });
  } else if (pageCount === 1 && input.bytes.byteLength < 80 * 1024) {
    signals.push({
      code: "tiny_one_page",
      severity: "low",
      message: "Single-page PDF under 80 KB — unusual for a real statement",
    });
  }

  // ===== Splice / multi-producer scan against raw bytes =====
  try {
    const producerHits = countMatches(ascii, PRODUCER_RE);
    const creatorHits = countMatches(ascii, CREATOR_RE);
    if (producerHits > 1) {
      signals.push({
        code: "multi_producer",
        severity: "high",
        message: `${producerHits} Producer dict entries found — likely spliced from multiple sources`,
      });
    }
    if (creatorHits > 1) {
      signals.push({
        code: "multi_creator",
        severity: "med",
        message: `${creatorHits} Creator dict entries found`,
      });
    }
    // Incremental updates (real /Prev pointer + multiple xref tables) — often a
    // benign signal but worth flagging for low-trust files.
    if (countMatches(ascii, /\/Prev\s+\d/g) >= 2) {
      signals.push({
        code: "incremental_updates",
        severity: "low",
        message: "PDF has been incrementally updated multiple times",
      });
    }
    // Heuristic: presence of TouchUp text objects inserted by editors.
    if (
      ascii.includes("TouchUp_TextEdit") ||
      ascii.includes("/Subj (Annotation)")
    ) {
      signals.push({
        code: "edit_annotations",
        severity: "med",
        message: "PDF contains text-edit / annotation traces from a PDF editor",
      });
    }
  } catch {
    // raw scan is best-effort
  }

  const riskScore = scoreFromSignals(signals);
  const verdict = verdictFromScore(riskScore);

  return {
    source: "pdf_inspector",
    verdict,
    riskScore,
    signals,
    rawJson: {
      producer,
      creator,
      author,
      title,
      subject,
      creationDate: creationDate?.toISOString() ?? null,
      modDate: modDate?.toISOString() ?? null,
      pageCount,
      sizeBytes: input.bytes.byteLength,
    },
  };
}
