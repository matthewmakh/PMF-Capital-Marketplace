"use client";

import { useEffect, useState } from "react";
import { FadeIn, SlideIn, CountUp, ProgressFill } from "../animations";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  Check,
  Banknote,
  Activity,
  AlertTriangle,
  TrendingDown,
  Building2,
  CheckCircle2,
  Clock,
  ScanLine,
  Sparkles,
  Loader2,
  ClipboardCheck,
  Database,
  Scale,
  CircuitBoard,
  KeyRound,
  Eye,
  Workflow,
} from "lucide-react";

// ================================================================
// SCENE 1 — HERO
// ================================================================
export function SceneHero({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <FadeIn show={active} delay={200}>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy-600 mb-8 mx-auto">
          <ShieldCheck className="h-9 w-9 text-white" />
        </div>
      </FadeIn>
      <FadeIn show={active} delay={600}>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          MCA Underwriting
        </h1>
      </FadeIn>
      <FadeIn show={active} delay={1000}>
        <p className="text-xl text-navy-200 mb-3">
          From merchant submission to funding decision — automated
        </p>
      </FadeIn>
      <FadeIn show={active} delay={1400}>
        <p className="text-base text-navy-300/70 max-w-xl">
          Document intake. Bank statement analytics. Tamper detection. Credit,
          OFAC, UCC, KYB pulls. All in one platform — under 90 seconds per
          deal.
        </p>
      </FadeIn>
      <FadeIn show={active} delay={2000}>
        <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-xl">
          {[
            "Plaid",
            "Azure Document Intelligence",
            "Microbilt",
            "DataMerch",
            "Inscribe",
            "Wolters Kluwer iLien",
            "Middesk",
          ].map((t, i) => (
            <span
              key={i}
              className="rounded-full border border-navy-700 px-3 py-1 text-xs text-navy-400"
            >
              {t}
            </span>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 2 — THE PROBLEM
// ================================================================
export function SceneProblem({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          The Problem
        </p>
        <h2 className="text-2xl font-bold text-white mb-6">
          MCA underwriting today
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Before */}
        <SlideIn show={active} delay={300} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-danger/10 border-b border-danger/20 px-4 py-2.5">
              <p className="text-xs uppercase tracking-wider text-danger font-semibold">
                Manual process
              </p>
            </div>
            <ul className="px-5 py-4 space-y-3 text-sm">
              {[
                {
                  text: "Email a broker, ask for 3 months of statements",
                  time: "10 min",
                },
                { text: "Open each PDF, eyeball for tampering", time: "15 min" },
                {
                  text: "Type transactions into a spreadsheet",
                  time: "45 min",
                },
                { text: "Calculate true revenue, neg days, NSFs", time: "30 min" },
                {
                  text: "Pull credit & OFAC in three vendor portals",
                  time: "20 min",
                },
                {
                  text: "Check DataMerch and Secretary of State",
                  time: "15 min",
                },
                { text: "Search UCC filings by hand", time: "20 min" },
              ].map((row, i) => (
                <FadeIn key={i} show={active} delay={600 + i * 200}>
                  <li className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Clock className="h-3.5 w-3.5 text-navy-500 mt-0.5 shrink-0" />
                      <span className="text-navy-300">{row.text}</span>
                    </div>
                    <span className="text-xs text-danger/80 font-mono">
                      {row.time}
                    </span>
                  </li>
                </FadeIn>
              ))}
              <FadeIn show={active} delay={2100}>
                <li className="flex items-center justify-between pt-3 mt-2 border-t border-danger/20">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-lg font-bold text-danger tabular-nums">
                    ~2h 35m
                  </span>
                </li>
              </FadeIn>
            </ul>
          </div>
        </SlideIn>

        {/* After */}
        <SlideIn show={active} delay={500} direction="right">
          <div className="rounded-xl bg-navy-900/80 border border-profit/30 overflow-hidden">
            <div className="bg-profit/10 border-b border-profit/20 px-4 py-2.5">
              <p className="text-xs uppercase tracking-wider text-profit font-semibold">
                With this platform
              </p>
            </div>
            <ul className="px-5 py-4 space-y-3 text-sm">
              {[
                "Send merchant a single link",
                "Auto tamper scan on every PDF",
                "Statements parsed by Azure + Plaid",
                "Metrics engine computes everything",
                "All vendor pulls fire in parallel",
                "Paper grade composes in real time",
                "Underwriter clicks Approve",
              ].map((text, i) => (
                <FadeIn key={i} show={active} delay={800 + i * 180}>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-profit mt-0.5 shrink-0" />
                    <span className="text-navy-200">{text}</span>
                  </li>
                </FadeIn>
              ))}
              <FadeIn show={active} delay={2200}>
                <li className="flex items-center justify-between pt-3 mt-2 border-t border-profit/20">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-lg font-bold text-profit tabular-nums">
                    &lt; 90 sec
                  </span>
                </li>
              </FadeIn>
            </ul>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={3000}>
        <p className="text-sm text-navy-400 text-center mt-6">
          You hire one underwriter to do the work of five.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 3 — MERCHANT PORTAL UPLOAD
// ================================================================
export function ScenePortalUpload({ active }: { active: boolean }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<
    { name: string; size: string; status: "uploading" | "done" }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setDragOver(false);
      setFiles([]);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setDragOver(true), 1200));
    timers.push(
      setTimeout(() => {
        setDragOver(false);
        setFiles([
          { name: "ChaseStatement_2026-01.pdf", size: "284 KB", status: "uploading" },
          { name: "ChaseStatement_2025-12.pdf", size: "291 KB", status: "uploading" },
          { name: "ChaseStatement_2025-11.pdf", size: "276 KB", status: "uploading" },
          { name: "Drivers_License.jpg", size: "412 KB", status: "uploading" },
          { name: "Voided_Check.pdf", size: "98 KB", status: "uploading" },
        ]);
      }, 1900)
    );
    timers.push(
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f, i) => (i < 3 ? { ...f, status: "done" } : f))
        );
      }, 3200)
    );
    timers.push(
      setTimeout(() => {
        setFiles((prev) => prev.map((f) => ({ ...f, status: "done" })));
      }, 4400)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Merchant Portal — /apply/[token]
        </p>
        <h2 className="text-2xl font-bold text-white mb-6">
          Zero-friction document intake
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-[2fr_1fr] gap-5">
        {/* Drop zone */}
        <SlideIn show={active} delay={300} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700/30">
              <p className="text-sm font-semibold text-white">
                Premier Merchant Funding — Application Portal
              </p>
              <p className="text-[11px] text-navy-500">
                For: Sunrise Auto Body LLC
              </p>
            </div>
            <div className="px-5 py-5">
              <div
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors duration-500 ${
                  dragOver
                    ? "border-navy-300 bg-navy-700/40"
                    : "border-navy-700/60 bg-navy-800/40"
                }`}
              >
                <Upload
                  className={`h-8 w-8 transition-colors duration-300 ${dragOver ? "text-navy-200" : "text-navy-400"}`}
                />
                <p
                  className={`mt-3 text-sm font-medium transition-colors duration-300 ${
                    dragOver ? "text-white" : "text-navy-300"
                  }`}
                >
                  {dragOver
                    ? "Drop the files to upload"
                    : "Drag and drop, or click to choose files"}
                </p>
                <p className="mt-1 text-xs text-navy-500">
                  Bank statements, ID, voided check
                </p>
              </div>

              {files.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-md border border-navy-700/50 bg-navy-800/40 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="h-3.5 w-3.5 text-navy-400 shrink-0" />
                        <span className="truncate text-navy-200">{f.name}</span>
                        <span className="text-navy-500 shrink-0">
                          {f.size}
                        </span>
                      </div>
                      <div className="ml-3 flex items-center gap-1 shrink-0">
                        {f.status === "uploading" ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-navy-400" />
                            <span className="text-navy-500">Uploading</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 text-profit" />
                            <span className="text-profit">Uploaded</span>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SlideIn>

        {/* Side rail: Plaid option */}
        <SlideIn show={active} delay={500} direction="right">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden h-full">
            <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700/30 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">
                Or connect bank
              </p>
            </div>
            <div className="px-5 py-5 space-y-3 text-xs text-navy-400">
              <p className="leading-relaxed">
                Merchants who connect via Plaid get a faster decision and we
                pull 4 months of verified transactions directly from the bank
                — no PDFs to upload, nothing to tamper with.
              </p>
              <FadeIn show={active} delay={1400}>
                <div className="rounded-lg bg-navy-700 px-3 py-2 text-center text-sm font-semibold text-white">
                  Connect with Plaid →
                </div>
              </FadeIn>
              <FadeIn show={active} delay={2200}>
                <div className="rounded-md bg-profit/10 border border-profit/20 px-3 py-2 text-[11px] text-profit">
                  <CheckCircle2 className="inline h-3 w-3 mr-1" />
                  Bank-grade OAuth. We never see credentials.
                </div>
              </FadeIn>
            </div>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={5500}>
        <p className="text-sm text-navy-400 text-center mt-6">
          Brokers send one URL. No accounts to create. No back-and-forth.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 4 — TAMPER DETECTION
// ================================================================
export function SceneTamperDetection({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep(1), 1200)); // start scan
    timers.push(setTimeout(() => setStep(2), 2400)); // signal 1
    timers.push(setTimeout(() => setStep(3), 3300)); // signal 2
    timers.push(setTimeout(() => setStep(4), 4100)); // signal 3
    timers.push(setTimeout(() => setStep(5), 4800)); // verdict
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const signals = [
    {
      code: "producer_suspicious",
      severity: "high",
      msg: 'Producer is "Microsoft Word" — banks never produce statements with Word',
      pts: 35,
      show: step >= 2,
    },
    {
      code: "modified_after_creation",
      severity: "high",
      msg: "PDF modified 47 days after creation",
      pts: 35,
      show: step >= 3,
    },
    {
      code: "edit_annotations",
      severity: "med",
      msg: "TouchUp_TextEdit traces detected in raw bytes",
      pts: 18,
      show: step >= 4,
    },
  ];

  const score = step >= 4 ? 88 : step >= 3 ? 70 : step >= 2 ? 35 : 0;

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Document Tamper Detection
        </p>
        <h2 className="text-2xl font-bold text-white mb-6">
          Every PDF — scanned on upload
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-[1fr_1.4fr] gap-5">
        {/* The PDF being scanned */}
        <SlideIn show={active} delay={300} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700/30 flex items-center gap-2">
              <FileText className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white truncate">
                Statement_Nov2025.pdf
              </p>
            </div>
            <div className="relative px-5 py-6 text-[11px] text-navy-400 font-mono leading-relaxed bg-gradient-to-b from-navy-900 to-navy-950 h-56 overflow-hidden">
              <p>%PDF-1.7</p>
              <p>/Producer (Microsoft Word 2024)</p>
              <p>/Creator (Microsoft Word)</p>
              <p>/Author (john_smith)</p>
              <p>/CreationDate (D:20251115093000Z)</p>
              <p className="text-warning">/ModDate (D:20260102143000Z)</p>
              <p>/Title (Statement_Nov.docx)</p>
              <p className="mt-2 text-navy-600">… TouchUp_TextEdit …</p>
              <p className="text-navy-600">… /Subj (Annotation) …</p>

              {step >= 1 && step < 5 && (
                <div
                  className="absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-navy-300/20 to-transparent pointer-events-none transition-all"
                  style={{
                    top: `${20 + ((step - 1) * 22) % 70}%`,
                  }}
                >
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-navy-700/80 px-2 py-0.5 text-[10px] text-navy-200">
                    <ScanLine className="h-2.5 w-2.5 animate-pulse" />
                    Scanning
                  </div>
                </div>
              )}
            </div>
          </div>
        </SlideIn>

        {/* Signals firing */}
        <SlideIn show={active} delay={500} direction="right">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-warning" />
                <p className="text-sm font-semibold text-white">
                  Tamper Inspector
                </p>
              </div>
              <span className="rounded-full bg-navy-700/60 px-2 py-0.5 text-[10px] text-navy-300">
                Built-in · Free
              </span>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-navy-400">Risk score</span>
                <span
                  className={`text-2xl font-bold tabular-nums transition-colors duration-700 ${
                    score >= 60
                      ? "text-danger"
                      : score >= 25
                        ? "text-warning"
                        : "text-profit"
                  }`}
                >
                  {score}
                </span>
              </div>
              <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    score >= 60
                      ? "bg-danger"
                      : score >= 25
                        ? "bg-warning"
                        : "bg-profit"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <div className="border-t border-navy-700/40 pt-3 space-y-2">
                {signals.map((sig, i) => (
                  <div
                    key={i}
                    className={`rounded-md border px-3 py-2 transition-all duration-500 ${
                      sig.show
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1 pointer-events-none"
                    } ${
                      sig.severity === "high"
                        ? "border-danger/30 bg-danger/10"
                        : "border-warning/30 bg-warning/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <AlertTriangle
                          className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${sig.severity === "high" ? "text-danger" : "text-warning"}`}
                        />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-300">
                            {sig.code}
                          </p>
                          <p className="mt-0.5 text-xs text-navy-200">
                            {sig.msg}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-navy-400 shrink-0">
                        +{sig.pts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 mt-2 transition-all duration-700 ${
                  step >= 5
                    ? "opacity-100 border-danger/40 bg-danger/15"
                    : "opacity-0 -translate-y-1 pointer-events-none border-navy-700/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-danger" />
                  <span className="text-sm font-bold text-danger">
                    TAMPERED
                  </span>
                </div>
                <span className="text-[11px] text-navy-300">
                  Block from underwriting · alert analyst
                </span>
              </div>
            </div>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={5300}>
        <p className="text-sm text-navy-400 text-center mt-6">
          Catches the obvious tampering before a human ever opens the file.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 5 — STATEMENT ANALYTICS
// ================================================================
export function SceneStatementAnalytics({ active }: { active: boolean }) {
  const [pos, setPos] = useState<number>(0);
  // pos drives the "discovery" of MCA positions
  useEffect(() => {
    if (!active) {
      setPos(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPos(1), 1800));
    timers.push(setTimeout(() => setPos(2), 2800));
    timers.push(setTimeout(() => setPos(3), 3700));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const positions = [
    { name: "OnDeck Capital", daily: 320, since: "2025-09-14", show: pos >= 1 },
    { name: "Forward Financing", daily: 285, since: "2025-10-02", show: pos >= 2 },
    { name: "Kapitus", daily: 240, since: "2025-11-08", show: pos >= 3 },
  ];

  return (
    <div className="px-6 sm:px-10 py-7 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Bank Statement Analytics
        </p>
        <h2 className="text-2xl font-bold text-white mb-5">
          Sunrise Auto Body — 3 months
        </h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Gross deposits", value: 142_800, prefix: "$", delay: 400 },
          { label: "True revenue", value: 118_400, prefix: "$", delay: 600 },
          { label: "Avg daily balance", value: 9_200, prefix: "$", delay: 800 },
          { label: "MCA debit / deposit", value: 28, suffix: "%", delay: 1000, danger: true },
        ].map((stat, i) => (
          <SlideIn key={i} show={active} delay={stat.delay}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-navy-500">
                {stat.label}
              </p>
              <p
                className={`mt-1 text-xl font-bold tabular-nums ${
                  stat.danger ? "text-danger" : "text-white"
                }`}
              >
                <CountUp
                  end={stat.value}
                  prefix={stat.prefix || ""}
                  suffix={stat.suffix || ""}
                  show={active}
                  delay={stat.delay + 200}
                />
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Risk events */}
        <SlideIn show={active} delay={1200}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <Activity className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">Risk events</p>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <Row
                label="Negative days"
                value="6"
                tone="warn"
                delay={1500}
                active={active}
              />
              <Row
                label="NSF events"
                value="3"
                tone="warn"
                delay={1700}
                active={active}
              />
              <Row
                label="Overdrafts"
                value="1"
                tone="warn"
                delay={1900}
                active={active}
              />
              <Row
                label="Revenue trend"
                value="↘ -8%/mo"
                tone="danger"
                delay={2100}
                active={active}
              />
              <Row
                label="Deposit CV"
                value="34%"
                tone="neutral"
                delay={2300}
                active={active}
              />
              <Row
                label="Card revenue"
                value="62%"
                tone="ok"
                delay={2500}
                active={active}
              />
            </div>
          </div>
        </SlideIn>

        {/* Detected positions */}
        <SlideIn show={active} delay={1400}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-danger" />
                <p className="text-sm font-semibold text-white">
                  Open MCA positions
                </p>
              </div>
              <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-bold text-danger">
                <CountUp end={positions.filter((p) => p.show).length} show={active} delay={1700} />
              </span>
            </div>
            <div className="px-3 py-2">
              <table className="w-full text-xs">
                <thead className="text-[10px] text-navy-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-2 py-1.5">Funder</th>
                    <th className="text-right px-2 py-1.5">Daily debit</th>
                    <th className="text-right px-2 py-1.5">Since</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr
                      key={i}
                      className={`transition-all duration-500 ${
                        p.show ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <td className="px-2 py-1.5 text-navy-200 font-medium">
                        {p.name}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-white">
                        ${p.daily}
                      </td>
                      <td className="px-2 py-1.5 text-right text-navy-500">
                        {p.since}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={4200}>
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <p className="text-xs text-warning">
            Merchant disclosed <strong>1</strong> open position. Bank statement
            reveals <strong>3</strong>. Stacked-disclosure violation flagged.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  delay,
  active,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "danger" | "neutral";
  delay: number;
  active: boolean;
}) {
  const toneClass =
    tone === "ok"
      ? "text-profit"
      : tone === "warn"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-white";
  return (
    <FadeIn show={active} delay={delay}>
      <div className="flex items-center justify-between">
        <span className="text-navy-400 text-xs">{label}</span>
        <span className={`font-semibold tabular-nums ${toneClass}`}>
          {value}
        </span>
      </div>
    </FadeIn>
  );
}

// ================================================================
// SCENE 6 — VENDOR PULLS
// ================================================================
export function SceneVendorPulls({ active }: { active: boolean }) {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!active) {
      setProgress({});
      return;
    }
    const vendors = ["consumer", "business", "ofac", "datamerch", "ucc", "kyb"];
    const finalProgress: Record<string, number> = {};
    vendors.forEach((v) => (finalProgress[v] = 100));
    const timers: ReturnType<typeof setTimeout>[] = [];
    vendors.forEach((v, i) => {
      timers.push(
        setTimeout(() => {
          setProgress((p) => ({ ...p, [v]: 100 }));
        }, 1500 + i * 700)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const vendors = [
    {
      key: "consumer",
      label: "Microbilt — Consumer Credit (PG)",
      icon: KeyRound,
      result: "FICO 612 · 1 derog · 0 BK",
      tone: "warn" as const,
    },
    {
      key: "business",
      label: "Microbilt — Business Credit",
      icon: Building2,
      result: "Experian Intelliscore 54 · Moderate",
      tone: "ok" as const,
    },
    {
      key: "ofac",
      label: "Microbilt — OFAC / Watchlist",
      icon: Eye,
      result: "Clear",
      tone: "ok" as const,
    },
    {
      key: "datamerch",
      label: "DataMerch — MCA Blacklist",
      icon: Database,
      result: "Clear",
      tone: "ok" as const,
    },
    {
      key: "ucc",
      label: "Wolters Kluwer iLien — UCC",
      icon: Scale,
      result: "3 active filings (OnDeck, Forward, Kapitus)",
      tone: "warn" as const,
    },
    {
      key: "kyb",
      label: "Middesk — Business Legitimacy",
      icon: Building2,
      result: "Active in NY since 2019 · 2 officers",
      tone: "ok" as const,
    },
  ];

  const completed = Object.values(progress).filter((v) => v === 100).length;

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Third-Party Data
        </p>
        <h2 className="text-2xl font-bold text-white mb-6">
          6 vendors. Parallel. 8 seconds.
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {vendors.map((v, i) => {
          const done = progress[v.key] === 100;
          const Icon = v.icon;
          return (
            <SlideIn key={v.key} show={active} delay={300 + i * 120}>
              <div
                className={`rounded-xl border overflow-hidden transition-colors duration-500 ${
                  done
                    ? "border-profit/30 bg-navy-900/80"
                    : "border-navy-700/50 bg-navy-900/40"
                }`}
              >
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-navy-700/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 text-navy-300 shrink-0" />
                    <p className="text-xs font-semibold text-white truncate">
                      {v.label}
                    </p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-profit shrink-0" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-navy-400 shrink-0" />
                  )}
                </div>
                <div className="px-4 py-2.5">
                  <div
                    className={`text-xs transition-opacity duration-500 ${done ? "opacity-100" : "opacity-30"} ${
                      v.tone === "warn" ? "text-warning" : "text-profit"
                    }`}
                  >
                    {done ? v.result : "Querying…"}
                  </div>
                </div>
              </div>
            </SlideIn>
          );
        })}
      </div>

      <FadeIn show={active} delay={500}>
        <div className="rounded-xl border border-navy-700/50 bg-navy-900/80 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-navy-400">
              Total pulls
            </span>
            <span className="text-sm font-bold text-white tabular-nums">
              {completed} / {vendors.length}
            </span>
          </div>
          <ProgressFill
            value={(completed / vendors.length) * 100}
            color="bg-navy-400"
            show={active}
          />
          <p className="mt-3 text-[11px] text-navy-500">
            Every adapter has a typed mock-mode fallback so the platform runs
            end-to-end before any vendor contracts are in place.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 7 — UNDERWRITING SUMMARY
// ================================================================
export function SceneUnderwritingSummary({ active }: { active: boolean }) {
  const [grade, setGrade] = useState("UNGRADED");
  useEffect(() => {
    if (!active) {
      setGrade("UNGRADED");
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setGrade("D"), 1600));
    timers.push(setTimeout(() => setGrade("C"), 2200));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const gradeStyle =
    grade === "A"
      ? "bg-profit text-white"
      : grade === "B"
        ? "bg-navy-500 text-white"
        : grade === "C"
          ? "bg-warning text-white"
          : grade === "D"
            ? "bg-danger text-white"
            : "bg-navy-700 text-navy-300";

  return (
    <div className="px-6 sm:px-10 py-7 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-xs uppercase tracking-widest text-navy-400">
              Underwriting Summary
            </p>
            <h2 className="text-2xl font-bold text-white">
              Sunrise Auto Body LLC
            </h2>
            <p className="mt-1 text-xs text-navy-500">
              Brooklyn, NY · LLC · 32 months in business · NAICS 8111
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-navy-500">Paper grade</p>
            <span
              className={`mt-1 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold transition-all duration-500 ${gradeStyle}`}
            >
              {grade === "UNGRADED" ? "?" : grade}
            </span>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {[
          { label: "Requested", value: "$50K", delay: 400 },
          { label: "PG FICO", value: "612", delay: 500, tone: "warn" },
          { label: "True rev / mo", value: "$39K", delay: 600 },
          { label: "Open MCAs", value: "3", delay: 700, tone: "danger" },
        ].map((s, i) => (
          <SlideIn key={i} show={active} delay={s.delay}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-navy-500">
                {s.label}
              </p>
              <p
                className={`mt-1 text-lg font-bold tabular-nums ${
                  s.tone === "danger"
                    ? "text-danger"
                    : s.tone === "warn"
                      ? "text-warning"
                      : "text-white"
                }`}
              >
                {s.value}
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <SlideIn show={active} delay={900}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2 border-b border-navy-700/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-300">
                Signals composited
              </p>
            </div>
            <ul className="px-5 py-3 space-y-1.5 text-xs">
              {[
                { txt: "Bank statement metrics ✓", c: "profit", d: 1100 },
                { txt: "Tamper inspector ✓ Clean", c: "profit", d: 1200 },
                { txt: "Consumer credit ✓ Pulled", c: "profit", d: 1300 },
                { txt: "Business credit ✓ Pulled", c: "profit", d: 1400 },
                { txt: "OFAC ✓ Clear", c: "profit", d: 1500 },
                { txt: "DataMerch ✓ Clear", c: "profit", d: 1600 },
                { txt: "UCC ⚠ 3 active filings", c: "warning", d: 1700 },
                { txt: "KYB ✓ Active in NY", c: "profit", d: 1800 },
              ].map((s, i) => (
                <FadeIn key={i} show={active} delay={s.d}>
                  <li className={`text-${s.c} text-navy-200`}>{s.txt}</li>
                </FadeIn>
              ))}
            </ul>
          </div>
        </SlideIn>

        <SlideIn show={active} delay={1100}>
          <div className="rounded-xl bg-warning/5 border border-warning/30 overflow-hidden">
            <div className="bg-warning/10 px-4 py-2 border-b border-warning/20 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                Risk flags
              </p>
            </div>
            <ul className="px-5 py-3 space-y-1.5 text-xs text-navy-100">
              {[
                "3 open MCA positions detected (merchant disclosed 1)",
                "MCA debit load 28% of deposits",
                "Revenue declined 8%/mo over 3-month period",
                "FICO 612 below B-paper threshold (620)",
                "6 negative days across 3 months",
              ].map((s, i) => (
                <FadeIn key={i} show={active} delay={2000 + i * 200}>
                  <li>• {s}</li>
                </FadeIn>
              ))}
            </ul>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={3500}>
        <div className="mt-4 rounded-lg bg-navy-800/40 border border-navy-700/40 px-4 py-2.5 flex items-center gap-3">
          <CircuitBoard className="h-4 w-4 text-navy-300 shrink-0" />
          <p className="text-xs text-navy-300">
            Grade engine: FICO 612 + 32 mo TIB + $39K/mo rev + 3 open positions
            → <span className="font-semibold text-warning">C paper</span>.
            Recommend factor 1.42, term 5 mo, 50% of monthly revenue.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 8 — DECISION & AUDIT TRAIL
// ================================================================
export function SceneDecision({ active }: { active: boolean }) {
  const [clicked, setClicked] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (!active) {
      setClicked(false);
      setLogged(false);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setClicked(true), 1800));
    timers.push(setTimeout(() => setLogged(true), 2600));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="px-6 sm:px-10 py-7 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Decision &amp; Audit
        </p>
        <h2 className="text-2xl font-bold text-white mb-6">
          Underwriter clicks. Audit log captures everything.
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-[1.2fr_1.4fr] gap-5">
        {/* Decision panel */}
        <SlideIn show={active} delay={300} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">
                Underwriter Decision
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="rounded-md border border-navy-700/50 bg-navy-800/30 px-3 py-2.5">
                <p className="text-[11px] text-navy-500 mb-1">
                  Counter-offer notes
                </p>
                <p className="text-xs text-navy-200 italic">
                  &ldquo;C-paper. Approve $35K (not $50K) at 1.42 factor, 5 mo
                  term. Conditional on payoff letter for OnDeck position
                  (consolidation).&rdquo;
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-all ${
                    clicked
                      ? "bg-profit text-white shadow-lg shadow-profit/20 scale-105"
                      : "bg-profit/80 text-white"
                  }`}
                >
                  <CheckCircle2 className="inline h-4 w-4 mr-1" />
                  Approve
                </button>
                <button className="flex-1 rounded-md bg-navy-700/50 px-3 py-2 text-sm font-medium text-navy-300">
                  Stips
                </button>
                <button className="flex-1 rounded-md bg-navy-700/50 px-3 py-2 text-sm font-medium text-navy-300">
                  Decline
                </button>
              </div>

              {clicked && (
                <FadeIn show={active} delay={2000}>
                  <div className="rounded-lg bg-profit/10 border border-profit/30 px-3 py-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-profit" />
                    <span className="text-xs font-semibold text-profit">
                      Approved — application moved to Funding queue
                    </span>
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        </SlideIn>

        {/* Audit log */}
        <SlideIn show={active} delay={500} direction="right">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <Workflow className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">Audit Trail</p>
              <span className="ml-auto text-[10px] text-navy-500">
                Immutable · GLBA-ready
              </span>
            </div>
            <ul className="px-5 py-3 space-y-2 text-xs font-mono">
              {[
                {
                  ts: "14:22:01",
                  action: "UW_APP_CREATED",
                  detail: "Sunrise Auto Body LLC",
                  delay: 700,
                },
                {
                  ts: "14:22:04",
                  action: "UW_DOC_UPLOADED",
                  detail: "× 5 documents",
                  delay: 900,
                },
                {
                  ts: "14:22:06",
                  action: "UW_TAMPER_CHECK",
                  detail: "× 3 PDFs · Clean",
                  delay: 1100,
                },
                {
                  ts: "14:22:18",
                  action: "UW_ANALYSIS_RUN",
                  detail: "azure_doc_intel",
                  delay: 1300,
                },
                {
                  ts: "14:22:26",
                  action: "UW_VENDOR_PULL",
                  detail: "× 6 vendors",
                  delay: 1500,
                },
                {
                  ts: logged ? "14:22:48" : "—:—:—",
                  action: "UW_DECISION_MADE",
                  detail: "approve · C grade",
                  delay: 2700,
                  highlight: true,
                },
              ].map((row, i) => (
                <FadeIn key={i} show={active} delay={row.delay}>
                  <li
                    className={`flex items-start gap-2 ${
                      row.highlight && logged
                        ? "text-profit"
                        : "text-navy-300"
                    }`}
                  >
                    <span className="text-navy-500 tabular-nums shrink-0">
                      {row.ts}
                    </span>
                    <span className="font-semibold tabular-nums shrink-0 w-44">
                      {row.action}
                    </span>
                    <span className="text-navy-400 truncate">{row.detail}</span>
                  </li>
                </FadeIn>
              ))}
            </ul>
            <div className="border-t border-navy-700/30 px-5 py-2 text-[10px] text-navy-500 flex gap-3">
              <span>Actor: matt@pmf.com</span>
              <span>IP: 64.71.×.×</span>
              <span>UA: Chrome 132</span>
            </div>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={3500}>
        <p className="text-sm text-navy-400 text-center mt-6">
          Every decision is reproducible. Every signal is preserved. Every
          actor is named.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 9 — CLOSING
// ================================================================
export function SceneClosing({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <FadeIn show={active} delay={200}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-profit/15 border border-profit/30 mb-6 mx-auto">
          <Sparkles className="h-8 w-8 text-profit" />
        </div>
      </FadeIn>
      <FadeIn show={active} delay={500}>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          That was 90 seconds.
        </h1>
      </FadeIn>
      <FadeIn show={active} delay={900}>
        <p className="text-base text-navy-300 max-w-xl mb-8">
          In a real shop that&apos;s 2½ hours of underwriter time saved per file.
          Every file. Every day.
        </p>
      </FadeIn>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full mb-8">
        {[
          { label: "Per-file time", before: "2h 35m", after: "90 sec", delay: 1200 },
          { label: "Fraud caught", before: "Eyeballed", after: "Auto + Inscribe", delay: 1400 },
          { label: "Vendor pulls", before: "Sequential", after: "Parallel", delay: 1600 },
          { label: "Audit trail", before: "Spreadsheet", after: "Immutable", delay: 1800 },
        ].map((m, i) => (
          <SlideIn key={i} show={active} delay={m.delay}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-3 text-left">
              <p className="text-[10px] uppercase tracking-wider text-navy-500">
                {m.label}
              </p>
              <p className="mt-1 text-xs text-navy-500 line-through">
                {m.before}
              </p>
              <p className="text-sm font-bold text-profit">{m.after}</p>
            </div>
          </SlideIn>
        ))}
      </div>

      <FadeIn show={active} delay={2200}>
        <div className="grid sm:grid-cols-3 gap-2 max-w-2xl text-xs text-navy-400">
          {[
            "Plaid live bank linking",
            "Azure Document Intelligence OCR",
            "PDF tamper inspector + Inscribe",
            "Microbilt, DataMerch, UCC, KYB",
            "Decision panel + audit log",
            "Built on the same stack as your investor marketplace",
          ].map((t, i) => (
            <div
              key={i}
              className="rounded-lg border border-navy-800 bg-navy-900/40 px-3 py-2 flex items-center gap-1.5"
            >
              <Check className="h-3 w-3 text-profit shrink-0" />
              <span className="truncate">{t}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn show={active} delay={3000}>
        <p className="mt-8 text-xs text-navy-500">
          PMF Capital · MCA Underwriting Platform
        </p>
      </FadeIn>
    </div>
  );
}
