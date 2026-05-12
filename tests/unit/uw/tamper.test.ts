import { describe, it, expect } from "vitest";
import { inspectPdf } from "@/lib/uw/tamper/pdf-inspector";
import {
  scoreFromSignals,
  verdictFromScore,
} from "@/lib/uw/tamper/types";

// pdf-lib silently overrides setProducer and setModificationDate during
// save(). For tests that need precise control over those fields, build the
// PDF bytes by hand with a correctly-offsetted xref.
function buildRawPdf(opts: {
  producer?: string;
  creator?: string;
  author?: string;
  title?: string;
  pages?: number;
  creationDate?: string; // PDF format e.g. D:20260301000000Z
  modDate?: string;
}): Uint8Array {
  const pages = opts.pages ?? 1;
  const pageRefs = Array.from({ length: pages }, (_, i) => `${4 + i} 0 R`).join(
    " "
  );
  const infoEntries: string[] = [];
  if (opts.producer) infoEntries.push(`/Producer (${opts.producer})`);
  if (opts.creator) infoEntries.push(`/Creator (${opts.creator})`);
  if (opts.author) infoEntries.push(`/Author (${opts.author})`);
  if (opts.title) infoEntries.push(`/Title (${opts.title})`);
  if (opts.creationDate)
    infoEntries.push(`/CreationDate (${opts.creationDate})`);
  if (opts.modDate) infoEntries.push(`/ModDate (${opts.modDate})`);

  const objBodies: string[] = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Count ${pages} /Kids [${pageRefs}] >>`,
    `<< ${infoEntries.join(" ")} >>`, // Info dict (object 3)
  ];
  for (let i = 0; i < pages; i++) {
    objBodies.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>`
    );
  }

  let pdf = "%PDF-1.4\n%âãÏÓ\n";
  const offsets: number[] = [];
  for (let i = 0; i < objBodies.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objBodies[i]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objBodies.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 0; i < objBodies.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objBodies.length + 1} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf, "latin1"));
}


describe("inspectPdf — clean bank statement", () => {
  it("returns CLEAN for a known bank producer", async () => {
    const bytes = buildRawPdf({
      producer: "ACI Document Production",
      creator: "Chase Bank Statement Generator",
      title: "Account Statement",
      pages: 5,
      creationDate: "D:20260302100000Z",
      modDate: "D:20260302100000Z",
    });
    const r = await inspectPdf({ bytes, filename: "Statement_2026-02.pdf" });
    expect(r.source).toBe("pdf_inspector");
    expect(r.verdict).toBe("CLEAN");
    expect(r.riskScore).toBeLessThan(25);
  });
});

describe("inspectPdf — suspicious producers", () => {
  it("flags PDFs produced by Microsoft Word as high-risk", async () => {
    const bytes = buildRawPdf({
      producer: "Microsoft Word 2024",
      creator: "Microsoft Word",
      pages: 3,
    });
    const r = await inspectPdf({ bytes, filename: "statement.pdf" });
    expect(r.signals.some((s) => s.code === "producer_suspicious")).toBe(true);
    expect(r.riskScore).toBeGreaterThanOrEqual(35);
    expect(["SUSPICIOUS", "TAMPERED"]).toContain(r.verdict);
  });

  it("flags Adobe Photoshop as critical-risk re-export", async () => {
    const bytes = buildRawPdf({
      producer: "Adobe Photoshop 25.0",
      creator: "Adobe Photoshop",
      pages: 3,
    });
    const r = await inspectPdf({ bytes, filename: "stmt.pdf" });
    expect(r.signals.some((s) => s.code === "producer_suspicious")).toBe(true);
    expect(r.verdict).not.toBe("CLEAN");
  });
});

describe("inspectPdf — modification date drift", () => {
  it("flags modification more than 7 days after creation", async () => {
    const bytes = buildRawPdf({
      producer: "ACI Document Production",
      creationDate: "D:20260301000000Z",
      modDate: "D:20260320000000Z",
      pages: 3,
    });
    const r = await inspectPdf({ bytes, filename: "Statement.pdf" });
    expect(
      r.signals.some((s) => s.code === "modified_after_creation")
    ).toBe(true);
  });
});

describe("inspectPdf — missing metadata", () => {
  it("flags PDFs with no producer or creator metadata", async () => {
    const bytes = buildRawPdf({ title: "Statement", pages: 3 });
    const r = await inspectPdf({ bytes, filename: "Statement.pdf" });
    expect(r.signals.some((s) => s.code === "producer_missing")).toBe(true);
  });
});

describe("scoring helpers", () => {
  it("caps score at 100", () => {
    expect(
      scoreFromSignals([
        { code: "a", severity: "critical", message: "x" },
        { code: "b", severity: "critical", message: "y" },
        { code: "c", severity: "high", message: "z" },
      ])
    ).toBe(100);
  });

  it("maps score thresholds to verdicts", () => {
    expect(verdictFromScore(0)).toBe("CLEAN");
    expect(verdictFromScore(24)).toBe("CLEAN");
    expect(verdictFromScore(25)).toBe("SUSPICIOUS");
    expect(verdictFromScore(59)).toBe("SUSPICIOUS");
    expect(verdictFromScore(60)).toBe("TAMPERED");
  });
});
