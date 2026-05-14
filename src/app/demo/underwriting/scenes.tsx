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
  TrendingUp,
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
  Mail,
  Inbox,
  Send,
  ArrowRight,
  AlertOctagon,
  Network,
  Stamp,
  Award,
  Briefcase,
  ClipboardList,
  BarChart3,
  Users,
  Search,
} from "lucide-react";

// ================================================================
// SHARED — small visual helpers (used across multiple scenes)
// ================================================================

function LiveIndicator({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-profit/30 bg-profit/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-profit">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-profit opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-profit" />
      </span>
      {label}
    </span>
  );
}

function MiniSparkline({
  data,
  color = "#4169a5",
  className = "",
  height = 20,
}: {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div
      className={`flex items-end gap-0.5 ${className}`}
      style={{ height }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px]"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            backgroundColor: color,
            opacity: 0.35 + (i / data.length) * 0.55,
          }}
        />
      ))}
    </div>
  );
}

// ================================================================
// SCENE 1 — HERO (vendor constellation + live operations tickers)
// ================================================================

const HERO_NODES: Array<{ label: string; metric: string; x: number; y: number }> = [
  { label: "Plaid",      metric: "856 txns",     x: 50, y: 8 },
  { label: "Azure DI",   metric: "3 statements", x: 84, y: 25 },
  { label: "Microbilt",  metric: "FICO 612",     x: 92, y: 58 },
  { label: "Middesk",    metric: "Active 2019",  x: 68, y: 88 },
  { label: "iLien",      metric: "3 UCC",        x: 32, y: 88 },
  { label: "DataMerch",  metric: "0 hits",       x: 8,  y: 58 },
  { label: "Inscribe",   metric: "Risk 12",      x: 16, y: 25 },
];

const HERO_OUTPUT: Array<{ label: string; value: string; tone: "warning" | "neutral" }> = [
  { label: "GRADE",  value: "C",      tone: "warning" },
  { label: "FACTOR", value: "1.42×",  tone: "neutral" },
  { label: "APR",    value: "94.2%",  tone: "neutral" },
];

const HERO_TICKER_DEALS =
  "APPROVED $35K · Sunrise Auto Body LLC · C-paper · 14:22:48   ⬩   DataMerch HIT · Coastal Marine LLC · 3 entries · DECLINED   ⬩   Tamper score 88 · Statement_Nov2025.pdf · BLOCKED   ⬩   OFAC clear · Carlos Reyes   ⬩   3 MCA positions detected · OnDeck · Forward · Kapitus   ⬩   UCC search · 3 active filings   ⬩   ";

const HERO_TICKER_VENDORS =
  "Plaid linked · Chase Business · 4 months pulled   ⬩   Azure DI · 856 transactions extracted   ⬩   FICO 612 · Experian soft pull · 1.2s   ⬩   Middesk KYB · Active NY since 2019   ⬩   Inscribe · risk 12 · CLEAN   ⬩   Business credit 54 · Moderate   ⬩   ";

const HERO_TICKER_PORTFOLIO =
  "MTD funded $4.2M · 47 apps · 12 in intake · 8 under review · loss avoided $580K · default rate 8.4% · fraud caught 11 · paper grades A 2% / B 6% / C 12% / D 28%   ⬩   ";

function HeroTicker({
  text,
  className,
  direction,
  speed,
  visible,
  baseOpacity,
}: {
  text: string;
  className: string;
  direction: "left" | "right";
  speed: number;
  visible: boolean;
  baseOpacity: number;
}) {
  return (
    <div
      className={`absolute left-0 right-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        opacity: visible ? baseOpacity : 0,
        transition: "opacity 1600ms ease-out",
      }}
    >
      <div
        className="whitespace-nowrap font-mono text-[11px] text-navy-200 tracking-wide"
        style={{
          width: "200%",
          animation: `ticker-${direction} ${speed}s linear infinite`,
        }}
      >
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}

export function SceneHero({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 200)); // tickers fade in
    timers.push(setTimeout(() => setPhase(2), 500)); // hub
    for (let i = 0; i < HERO_NODES.length; i++) {
      timers.push(setTimeout(() => setPhase((p) => Math.max(p, 3 + i)), 850 + i * 220));
    }
    timers.push(setTimeout(() => setPhase((p) => Math.max(p, 10)), 2500)); // title
    timers.push(setTimeout(() => setPhase((p) => Math.max(p, 11)), 2900)); // subtitle
    timers.push(setTimeout(() => setPhase((p) => Math.max(p, 12)), 3300)); // output 1
    timers.push(setTimeout(() => setPhase((p) => Math.max(p, 13)), 3550)); // output 2
    timers.push(setTimeout(() => setPhase((p) => Math.max(p, 14)), 3800)); // output 3
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const tickersVisible = phase >= 1;
  const hubVisible = phase >= 2;
  const nodesVisible = Math.max(0, phase - 2); // 0..7
  const titleVisible = phase >= 10;
  const subtitleVisible = phase >= 11;
  const outputRevealed = Math.max(0, phase - 11); // 0..3

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background tickers */}
      <HeroTicker
        text={HERO_TICKER_DEALS}
        className="top-[10%]"
        direction="left"
        speed={55}
        visible={tickersVisible}
        baseOpacity={0.18}
      />
      <HeroTicker
        text={HERO_TICKER_VENDORS}
        className="top-[50%]"
        direction="right"
        speed={68}
        visible={tickersVisible}
        baseOpacity={0.1}
      />
      <HeroTicker
        text={HERO_TICKER_PORTFOLIO}
        className="bottom-[8%]"
        direction="left"
        speed={75}
        visible={tickersVisible}
        baseOpacity={0.14}
      />

      {/* Radial vignette so tickers fade toward edges and constellation pops */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at center, rgba(6,10,16,0) 0%, rgba(6,10,16,0.55) 55%, rgba(6,10,16,0.92) 100%)",
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        {/* Constellation */}
        <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: "8 / 5" }}>
          {/* SVG: connecting lines + travelling pulse dots */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {HERO_NODES.map((n, i) => {
              const drawn = nodesVisible > i;
              return (
                <line
                  key={`line-${i}`}
                  x1={n.x}
                  y1={n.y}
                  x2={50}
                  y2={50}
                  stroke="#4169a5"
                  strokeWidth="0.3"
                  strokeOpacity="0.5"
                  strokeDasharray="100"
                  strokeDashoffset={drawn ? 0 : 100}
                  style={{
                    transition: "stroke-dashoffset 700ms ease-out",
                  }}
                />
              );
            })}

            {HERO_NODES.map((n, i) => {
              if (nodesVisible <= i) return null;
              return (
                <circle key={`pulse-${i}`} r="0.9" fill="#8da5c9">
                  <animate
                    attributeName="cx"
                    from={n.x}
                    to={50}
                    dur="2.8s"
                    begin={`${i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    from={n.y}
                    to={50}
                    dur="2.8s"
                    begin={`${i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.2;0.8;1"
                    dur="2.8s"
                    begin={`${i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </svg>

          {/* Vendor node labels — name + live metric */}
          {HERO_NODES.map((n, i) => (
            <div
              key={n.label}
              className="absolute transition-all duration-500"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: "translate(-50%, -50%)",
                opacity: nodesVisible > i ? 1 : 0,
                scale: nodesVisible > i ? "1" : "0.85",
              }}
            >
              <div className="inline-flex flex-col items-start gap-0.5 rounded-lg border border-navy-500/40 bg-navy-900/85 px-2.5 py-1 whitespace-nowrap backdrop-blur-sm shadow-lg shadow-navy-950/60">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy-300 shadow-[0_0_6px_rgba(141,165,201,0.8)]" />
                  {n.label}
                </span>
                <span className="pl-3 text-[9px] font-mono uppercase tracking-wide text-navy-400">
                  {n.metric}
                </span>
              </div>
            </div>
          ))}

          {/* Scan rings around the hub */}
          <div
            className="absolute z-[5] pointer-events-none transition-opacity duration-1000"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: hubVisible ? 1 : 0,
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                border: "1px dashed rgba(65, 105, 165, 0.32)",
                animation: "ring-rotate 30s linear infinite",
              }}
            />
          </div>
          <div
            className="absolute z-[5] pointer-events-none transition-opacity duration-1000"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: hubVisible ? 1 : 0,
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                border: "1px dashed rgba(103, 135, 183, 0.42)",
                animation: "ring-rotate-reverse 18s linear infinite",
              }}
            />
          </div>

          {/* Hub */}
          <div
            className="absolute z-10 transition-all duration-700 ease-out"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${hubVisible ? 1 : 0.7})`,
              opacity: hubVisible ? 1 : 0,
            }}
          >
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute -inset-6 rounded-full bg-navy-400/20 blur-2xl" />
              {/* Pulsing mid ring */}
              <div className="absolute -inset-2 rounded-2xl bg-navy-500/30 blur-lg animate-pulse" />
              {/* Solid hub */}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 ring-2 ring-navy-300/50 shadow-xl shadow-navy-500/25">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Output badges — the computation's result */}
          <div
            className="absolute z-20"
            style={{
              left: "50%",
              top: "72%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex items-center gap-2">
              {HERO_OUTPUT.map((b, i) => {
                const visible = outputRevealed > i;
                const isWarn = b.tone === "warning";
                return (
                  <div
                    key={b.label}
                    className={`rounded-lg border px-3 py-1.5 backdrop-blur-md transition-all duration-500 ${
                      isWarn
                        ? "border-warning/50 bg-warning/15 shadow-lg shadow-warning/10"
                        : "border-navy-400/40 bg-navy-900/85 shadow-lg shadow-navy-950/60"
                    }`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible
                        ? "translateY(0) scale(1)"
                        : "translateY(8px) scale(0.92)",
                    }}
                  >
                    <p
                      className={`text-[8px] uppercase tracking-[0.18em] font-semibold ${
                        isWarn ? "text-warning/85" : "text-navy-400"
                      }`}
                    >
                      {b.label}
                    </p>
                    <p
                      className={`text-sm font-bold tabular-nums leading-tight ${
                        isWarn ? "text-warning" : "text-white"
                      }`}
                    >
                      {b.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Title block */}
        <div
          className="mt-8 text-center transition-all duration-700"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            MCA Underwriting
          </h1>
        </div>
        <div
          className="mt-3 text-center transition-all duration-700"
          style={{
            opacity: subtitleVisible ? 1 : 0,
            transform: subtitleVisible ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <p className="text-lg text-navy-200">
            From merchant submission to funding decision — automated
          </p>
          <p className="mt-1.5 text-xs uppercase tracking-widest text-navy-400">
            One platform · Seven integrations · 90 seconds per file
          </p>
        </div>
      </div>
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
                  text: "Chase broker for missing stips",
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
                "Underwriter picks an offer tier",
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
          Same headcount. Multiples of the deal flow.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 3 — MERCHANT PORTAL UPLOAD (with auto-classification)
// ================================================================
type DocTypeColor = "navy" | "warning" | "profit";

const PORTAL_FILES: Array<{
  name: string;
  size: string;
  docType: string;
  docTypeColor: DocTypeColor;
  confidence: number;
}> = [
  { name: "ChaseStatement_2026-01.pdf", size: "284 KB", docType: "Bank Statement", docTypeColor: "navy", confidence: 98 },
  { name: "ChaseStatement_2025-12.pdf", size: "291 KB", docType: "Bank Statement", docTypeColor: "navy", confidence: 99 },
  { name: "ChaseStatement_2025-11.pdf", size: "276 KB", docType: "Bank Statement", docTypeColor: "navy", confidence: 97 },
  { name: "Drivers_License.jpg", size: "412 KB", docType: "ID — Driver's License", docTypeColor: "warning", confidence: 94 },
  { name: "Voided_Check.pdf", size: "98 KB", docType: "Voided Check", docTypeColor: "profit", confidence: 96 },
];

function fileLifecycle(idx: number, stage: number): "hidden" | "uploading" | "detecting" | "classified" {
  // Stage progression:
  //   1 = drag-over visible
  //   2 = files appeared (all uploading)
  //   3 = all uploads complete (now detecting)
  //   4 = first 3 statements classified, ID + voided still detecting
  //   5 = ID also classified, voided still detecting
  //   6 = voided classified — all done
  if (stage < 2) return "hidden";
  if (stage === 2) return "uploading";
  if (stage === 3) return "detecting";
  if (idx < 3) return "classified";
  if (idx === 3) return stage >= 5 ? "classified" : "detecting";
  return stage >= 6 ? "classified" : "detecting";
}

export function ScenePortalUpload({ active }: { active: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage(1), 1200)); // drag-over
    timers.push(setTimeout(() => setStage(2), 1900)); // files appear (uploading)
    timers.push(setTimeout(() => setStage(3), 3000)); // detecting
    timers.push(setTimeout(() => setStage(4), 3700)); // statements classified
    timers.push(setTimeout(() => setStage(5), 4300)); // ID classified
    timers.push(setTimeout(() => setStage(6), 4800)); // voided check classified
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const dragOver = stage === 1;

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

              {stage >= 2 && (
                <ul className="mt-4 space-y-1.5">
                  {PORTAL_FILES.map((f, i) => {
                    const state = fileLifecycle(i, stage);
                    if (state === "hidden") return null;
                    const badgeClass =
                      f.docTypeColor === "navy"
                        ? "bg-navy-500/25 text-navy-100 border-navy-500/40"
                        : f.docTypeColor === "warning"
                          ? "bg-warning/15 text-warning border-warning/30"
                          : "bg-profit/15 text-profit border-profit/30";
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded-md border border-navy-700/50 bg-navy-800/40 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-3.5 w-3.5 text-navy-400 shrink-0" />
                          <span className="truncate text-navy-200">
                            {f.name}
                          </span>
                          <span className="text-navy-500 shrink-0">
                            {f.size}
                          </span>
                        </div>
                        <div className="ml-3 flex items-center gap-1.5 shrink-0">
                          {state === "uploading" && (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin text-navy-400" />
                              <span className="text-navy-500">Uploading</span>
                            </>
                          )}
                          {state === "detecting" && (
                            <>
                              <ScanLine className="h-3 w-3 animate-pulse text-navy-200" />
                              <span className="text-navy-200">Detecting…</span>
                            </>
                          )}
                          {state === "classified" && (
                            <>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${badgeClass}`}
                              >
                                <Check className="h-2.5 w-2.5" />
                                {f.docType}
                              </span>
                              <span className="text-[10px] font-mono font-semibold text-navy-400 tabular-nums">
                                {f.confidence}%
                              </span>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
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
                <span className="relative">
                  {/* Glow halo, only when score is in TAMPERED zone */}
                  <span
                    className={`absolute inset-0 -m-2 rounded-full blur-xl transition-opacity duration-500 ${
                      score >= 60 ? "bg-danger/30 opacity-100" : "opacity-0"
                    }`}
                  />
                  <span
                    className={`relative inline-block text-2xl font-bold tabular-nums transition-all duration-700 ${
                      score >= 60
                        ? "text-danger scale-110"
                        : score >= 25
                          ? "text-warning"
                          : "text-profit"
                    }`}
                  >
                    {score}
                  </span>
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
          {
            label: "Gross deposits",
            value: 142_800,
            prefix: "$",
            delay: 400,
            spark: [38, 42, 46, 45, 48, 51, 47, 49] as number[],
          },
          {
            label: "True revenue",
            value: 118_400,
            prefix: "$",
            delay: 600,
            spark: [45, 43, 41, 39, 41, 38, 36, 33] as number[], // declining trend
          },
          {
            label: "Avg daily balance",
            value: 9_200,
            prefix: "$",
            delay: 800,
          },
          {
            label: "MCA debit / deposit",
            value: 28,
            suffix: "%",
            delay: 1000,
            danger: true,
          },
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
              {stat.spark && (
                <MiniSparkline
                  data={stat.spark}
                  color={stat.label === "True revenue" ? "#d97706" : "#4169a5"}
                  className="mt-2"
                  height={14}
                />
              )}
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
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress({});
      setElapsedMs(0);
      return;
    }
    const vendors = ["consumer", "business", "ofac", "datamerch", "ucc", "kyb"];
    const timers: ReturnType<typeof setTimeout>[] = [];
    vendors.forEach((v, i) => {
      timers.push(
        setTimeout(() => {
          setProgress((p) => ({ ...p, [v]: 100 }));
        }, 1500 + i * 700)
      );
    });

    // Elapsed clock — starts at scene entry, freezes once all vendors complete
    const clockStart = Date.now();
    const finalMs = 1500 + 5 * 700 + 600; // last vendor + small tail
    const tick = setInterval(() => {
      const e = Date.now() - clockStart;
      if (e >= finalMs) {
        setElapsedMs(finalMs);
        clearInterval(tick);
      } else {
        setElapsedMs(e);
      }
    }, 50);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [active]);

  const vendors = [
    {
      key: "consumer",
      label: "Microbilt — Personal Guarantor Credit",
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

  const elapsedSec = (elapsedMs / 1000).toFixed(1);
  const allDone = completed === 6 && elapsedMs > 0;

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
              Third-Party Data
            </p>
            <h2 className="text-2xl font-bold text-white">
              6 vendors. Parallel.
            </h2>
          </div>
          {/* Live elapsed clock */}
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-navy-500">
              Elapsed
            </p>
            <p
              className={`mt-0.5 text-3xl font-bold tabular-nums leading-none transition-colors duration-500 ${
                allDone ? "text-profit" : "text-white"
              }`}
            >
              {elapsedSec}
              <span className="text-base text-navy-400 font-medium ml-1">s</span>
            </p>
          </div>
        </div>
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
            Each call is audit-logged with cost, latency, and result. Re-runnable
            from any application detail page.
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
            <span className="relative mt-1 inline-block">
              {/* Glow halo behind grade — fades up once the grade resolves */}
              <span
                className={`absolute inset-0 -m-2 rounded-2xl blur-xl transition-opacity duration-700 ${
                  grade === "UNGRADED" ? "opacity-0" : "opacity-80"
                } ${
                  grade === "A"
                    ? "bg-profit/40"
                    : grade === "B"
                      ? "bg-navy-500/40"
                      : grade === "C"
                        ? "bg-warning/40"
                        : grade === "D"
                          ? "bg-danger/40"
                          : ""
                }`}
              />
              <span
                className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold transition-all duration-500 ${gradeStyle}`}
              >
                {grade === "UNGRADED" ? "?" : grade}
              </span>
            </span>
            <p className="mt-1 text-[9px] uppercase tracking-wider text-navy-500 font-mono">
              8 sources · 14 signals
            </p>
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
              <div className="ml-auto flex items-center gap-2">
                <LiveIndicator />
                <span className="text-[10px] text-navy-500">
                  Immutable · GLBA-ready
                </span>
              </div>
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
                  detail: "Approved $35K · C grade",
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
    <div className="relative flex flex-col items-center justify-center h-full text-center px-6 overflow-hidden">
      {/* Faded constellation bookend — visual callback to the hero */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-1000"
        style={{ opacity: active ? 0.15 : 0 }}
      >
        <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: "8 / 5" }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {HERO_NODES.map((n, i) => (
              <line
                key={`closing-line-${i}`}
                x1={n.x}
                y1={n.y}
                x2={50}
                y2={50}
                stroke="#4169a5"
                strokeWidth="0.25"
                strokeOpacity="0.5"
              />
            ))}
            {HERO_NODES.map((n, i) => (
              <circle key={`pulse-c-${i}`} r="0.8" fill="#8da5c9">
                <animate attributeName="cx" from={n.x} to={50} dur="3.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" />
                <animate attributeName="cy" from={n.y} to={50} dur="3.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="3.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </svg>
        </div>
      </div>
      {/* Vignette so the foreground content stays legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at center, rgba(6,10,16,0.85) 0%, rgba(6,10,16,0.65) 60%, rgba(6,10,16,0.95) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
      <FadeIn show={active} delay={200}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-profit/15 border border-profit/30 mb-6 mx-auto">
          <Sparkles className="h-8 w-8 text-profit" />
        </div>
      </FadeIn>
      <FadeIn show={active} delay={500}>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          90 seconds per file.
        </h1>
      </FadeIn>
      <FadeIn show={active} delay={900}>
        <p className="text-base text-navy-300 max-w-xl mb-8">
          2½ hours of underwriter time saved per deal. Every file. Every day.
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
    </div>
  );
}

// ================================================================
// SCENE — BROKER EMAIL INTAKE
// ================================================================
export function SceneBrokerIntake({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-7 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Broker Intake
        </p>
        <h2 className="text-2xl font-bold text-white mb-6">
          Deals arrive by email. Pipeline updates itself.
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* Incoming email */}
        <SlideIn show={active} delay={300} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <Mail className="h-4 w-4 text-navy-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  New deal — Sunrise Auto Body LLC
                </p>
                <p className="text-[11px] text-navy-500 truncate">
                  From: broker@meridianfunding.com
                </p>
              </div>
            </div>
            <div className="px-4 py-3 text-xs text-navy-300 leading-relaxed bg-navy-900">
              <p>Hi underwriting,</p>
              <p className="mt-2">Submitting a new file for review:</p>
              <p className="mt-2">
                <span className="text-white font-medium">Merchant:</span>{" "}
                Sunrise Auto Body LLC
                <br />
                <span className="text-white font-medium">EIN:</span> 12-3456789
                <br />
                <span className="text-white font-medium">Requested:</span>{" "}
                $50,000
                <br />
                <span className="text-white font-medium">Owner:</span> Carlos
                Reyes (100%)
                <br />
                <span className="text-white font-medium">Contact:</span>{" "}
                carlos@sunriseautobody.com
              </p>
              <p className="mt-2 text-navy-500">
                Statements + ID attached. Thanks.
              </p>
            </div>
          </div>
        </SlideIn>

        {/* Arrow + auto-parse pill */}
        <FadeIn show={active} delay={900}>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-navy-800 border border-navy-700/60 px-3 py-1">
              <Inbox className="h-3.5 w-3.5 text-navy-300" />
              <span className="text-[11px] text-navy-300 font-medium">
                Auto-parsed
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-navy-500" />
          </div>
        </FadeIn>

        {/* Parsed app card */}
        <SlideIn show={active} delay={1100} direction="right">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-navy-400">
                New Application
              </p>
              <span className="rounded-full bg-navy-700 px-2 py-0.5 text-[10px] font-bold text-navy-200">
                INTAKE
              </span>
            </div>
            <div className="px-4 py-3 text-xs">
              {[
                { l: "Merchant", v: "Sunrise Auto Body LLC", d: 1400 },
                { l: "EIN", v: "12-3456789", d: 1600 },
                { l: "Owner", v: "Carlos Reyes (100%)", d: 1800 },
                { l: "Requested", v: "$50,000", d: 2000 },
                { l: "Contact", v: "carlos@sunriseautobody.com", d: 2200 },
              ].map((row, i) => (
                <FadeIn key={i} show={active} delay={row.d}>
                  <div className="flex justify-between py-1.5 border-b border-navy-800/40 last:border-0">
                    <span className="text-navy-500">{row.l}</span>
                    <span className="font-medium text-white truncate ml-3">
                      {row.v}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </SlideIn>
      </div>

      {/* Auto-emit merchant portal link */}
      <FadeIn show={active} delay={2700}>
        <div className="mt-5 rounded-xl border border-profit/30 bg-profit/5 px-5 py-3 flex items-center gap-3">
          <Send className="h-4 w-4 text-profit shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-profit">
              Portal link auto-sent to merchant
            </p>
            <code className="block mt-0.5 truncate text-[11px] text-navy-300 font-mono">
              pmf.capital/apply/sR8nT2vWk9pQbAxLcMfGd
            </code>
          </div>
          <CheckCircle2 className="h-4 w-4 text-profit shrink-0" />
        </div>
      </FadeIn>

      <FadeIn show={active} delay={3300}>
        <p className="text-sm text-navy-400 text-center mt-5">
          Broker email → parsed application → merchant link sent. No keyboard
          touched.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE — PIPELINE DASHBOARD
// ================================================================
export function ScenePipelineDashboard({ active }: { active: boolean }) {
  const [slaPulse, setSlaPulse] = useState(false);
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (!active) {
      setSlaPulse(false);
      setRevealed(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 6; i++) {
      timers.push(
        setTimeout(
          () => setRevealed((r) => Math.max(r, i + 1)),
          1500 + i * 150
        )
      );
    }
    timers.push(setTimeout(() => setSlaPulse(true), 3500));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const rows = [
    {
      merchant: "Sunrise Auto Body LLC",
      state: "NY",
      amount: "$50K",
      status: "INTAKE",
      statusColor: "bg-navy-700 text-navy-200",
      age: "Just now",
      broker: "Meridian",
    },
    {
      merchant: "Greenfield Medical Supply",
      state: "MA",
      amount: "$60K",
      status: "DOCS PENDING",
      statusColor: "bg-warning/20 text-warning",
      age: "2h",
      broker: "Atlas",
    },
    {
      merchant: "Bella's Italian Kitchen",
      state: "NJ",
      amount: "$35K",
      status: "ANALYZING",
      statusColor: "bg-navy-500/30 text-navy-200",
      age: "4h",
      broker: "Pinnacle",
    },
    {
      merchant: "Metro Quick Mart",
      state: "NY",
      amount: "$25K",
      status: "UNDER REVIEW",
      statusColor: "bg-navy-500/30 text-navy-200",
      age: "1d · SLA",
      broker: "Meridian",
      sla: true,
    },
    {
      merchant: "Hudson Logistics Inc",
      state: "NJ",
      amount: "$120K",
      status: "UNDER REVIEW",
      statusColor: "bg-navy-500/30 text-navy-200",
      age: "6h",
      broker: "Atlas",
    },
    {
      merchant: "Coastal Marine Repair",
      state: "FL",
      amount: "$40K",
      status: "APPROVED",
      statusColor: "bg-profit/20 text-profit",
      age: "Today",
      broker: "Pinnacle",
    },
  ];

  return (
    <div className="px-6 sm:px-10 py-7 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Underwriting Pipeline
        </p>
        <h2 className="text-2xl font-bold text-white mb-5">
          Every file. Every stage. One screen.
        </h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: "MTD volume", value: 4_200_000, prefix: "$", delay: 300 },
          { label: "Apps this month", value: 47, delay: 450 },
          { label: "In intake", value: 12, delay: 600 },
          { label: "Under review", value: 8, delay: 750 },
          { label: "Decided today", value: 3, delay: 900 },
        ].map((s, i) => (
          <SlideIn key={i} show={active} delay={s.delay}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-navy-500">
                {s.label}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-white">
                <CountUp
                  end={s.value}
                  prefix={s.prefix || ""}
                  show={active}
                  delay={s.delay + 200}
                />
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      <SlideIn show={active} delay={1200}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
          <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">
                Active Applications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LiveIndicator />
              <span className="text-[11px] text-navy-500">
                Sorted by recency
              </span>
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-xs">
              <thead className="text-[10px] text-navy-500 uppercase tracking-wider">
                <tr className="border-b border-navy-700/30">
                  <th className="text-left px-4 py-2">Merchant</th>
                  <th className="text-left px-2 py-2 hidden sm:table-cell">
                    State
                  </th>
                  <th className="text-right px-2 py-2">Requested</th>
                  <th className="text-left px-2 py-2">Status</th>
                  <th className="text-right px-2 py-2 hidden sm:table-cell">
                    Age
                  </th>
                  <th className="text-left px-4 py-2 hidden md:table-cell">
                    Broker
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-navy-800/30 transition-all duration-500 ${
                      i < revealed ? "opacity-100" : "opacity-0"
                    } ${
                      row.sla && slaPulse
                        ? "bg-danger/10"
                        : i === 0
                          ? "bg-profit/5"
                          : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-navy-100">
                      {row.merchant}
                      {i === 0 && (
                        <span className="ml-2 rounded bg-profit/20 px-1.5 py-0.5 text-[9px] font-bold text-profit uppercase">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-navy-400 hidden sm:table-cell">
                      {row.state}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-white">
                      {row.amount}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.statusColor}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td
                      className={`px-2 py-2 text-right tabular-nums hidden sm:table-cell ${row.sla ? "text-danger font-semibold" : "text-navy-500"}`}
                    >
                      {row.sla && slaPulse && (
                        <AlertTriangle className="inline h-3 w-3 mr-1 animate-pulse" />
                      )}
                      {row.age}
                    </td>
                    <td className="px-4 py-2 text-navy-400 hidden md:table-cell">
                      {row.broker}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SlideIn>

      <FadeIn show={active} delay={4200}>
        <p className="text-sm text-navy-400 text-center mt-5">
          SLA breaches surface themselves. Brokers, status, aging — all live.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE — PRICING / OFFER GRID ENGINE
// ================================================================
export function ScenePricingEngine({ active }: { active: boolean }) {
  const [tier, setTier] = useState(0); // how many tiers revealed

  useEffect(() => {
    if (!active) {
      setTier(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setTier(1), 1600));
    timers.push(setTimeout(() => setTier(2), 2400));
    timers.push(setTimeout(() => setTier(3), 3200));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  // Daily ACH math: payback / (term_months × 22 business days)
  //   Conservative: 43500 / 88  = 494
  //   Standard:     49700 / 110 = 452
  //   Aggressive:   55200 / 132 = 418
  const offers = [
    {
      label: "Conservative",
      net: 30_000,
      factor: 1.45,
      term: 4,
      holdback: 15,
      daily: 494,
      payback: 43_500,
      tone: "navy",
    },
    {
      label: "Standard",
      net: 35_000,
      factor: 1.42,
      term: 5,
      holdback: 12,
      daily: 452,
      payback: 49_700,
      tone: "profit",
      highlight: true,
    },
    {
      label: "Aggressive",
      net: 40_000,
      factor: 1.38,
      term: 6,
      holdback: 10,
      daily: 418,
      payback: 55_200,
      tone: "warning",
    },
  ];

  // Factor-rate curve points (grade → factor)
  const curve = [
    { grade: "A", factor: 1.18 },
    { grade: "B", factor: 1.28 },
    { grade: "C", factor: 1.42, current: true },
    { grade: "D", factor: 1.5 },
  ];

  return (
    <div className="px-6 sm:px-10 py-6 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Pricing Engine
        </p>
        <h2 className="text-2xl font-bold text-white mb-4">
          From grade to offers — automatically
        </h2>
      </FadeIn>

      {/* Input strip */}
      <SlideIn show={active} delay={300}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 px-5 py-3 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-[10px] uppercase text-navy-500">Grade</p>
            <p className="mt-0.5 font-bold text-warning">C paper</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-navy-500">TIB</p>
            <p className="mt-0.5 font-bold text-white">32 months</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-navy-500">True rev/mo</p>
            <p className="mt-0.5 font-bold text-white tabular-nums">$39,400</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-navy-500">Open MCAs</p>
            <p className="mt-0.5 font-bold text-danger">3</p>
          </div>
        </div>
      </SlideIn>

      {/* 3 offer cards */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {offers.map((o, i) => {
          const visible = tier > i;
          const toneClass =
            o.tone === "profit"
              ? "border-profit/50 bg-profit/5 shadow-xl shadow-profit/15 ring-1 ring-profit/30"
              : o.tone === "warning"
                ? "border-warning/40 bg-warning/5"
                : "border-navy-700/50 bg-navy-900/80";
          return (
            <div
              key={i}
              className={`relative rounded-xl border overflow-hidden transition-all duration-700 ${toneClass} ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              } ${o.highlight ? "scale-[1.03] z-10" : ""}`}
            >
              {/* Recommended-card outer glow halo */}
              {o.highlight && visible && (
                <div className="absolute -inset-3 rounded-2xl bg-profit/25 blur-2xl -z-10 pointer-events-none" />
              )}
              <div className="px-4 py-2.5 border-b border-navy-700/30 flex items-center justify-between">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  {o.label}
                </p>
                {o.highlight && (
                  <span className="rounded-full bg-profit/20 px-2 py-0.5 text-[9px] font-bold text-profit">
                    Recommended
                  </span>
                )}
              </div>
              <div className="px-4 py-3">
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-2xl font-bold tabular-nums text-white">
                    ${(o.net / 1000).toFixed(0)}K
                  </p>
                  <p className="text-[11px] text-navy-500">funded</p>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <div>
                    <p className="text-navy-500">Factor</p>
                    <p className="font-semibold text-white tabular-nums">
                      {o.factor.toFixed(2)}×
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-500">Term</p>
                    <p className="font-semibold text-white tabular-nums">
                      {o.term} mo
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-500">Holdback</p>
                    <p className="font-semibold text-white tabular-nums">
                      {o.holdback}%
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-500">Daily ACH</p>
                    <p className="font-semibold text-white tabular-nums">
                      ${o.daily}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-navy-800/40 flex justify-between text-[11px]">
                  <span className="text-navy-500">Total payback</span>
                  <span className="font-bold text-white tabular-nums">
                    ${o.payback.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Factor-rate curve */}
      <FadeIn show={active} delay={3700}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 px-5 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-navy-300" />
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-300">
                Factor-rate curve · by paper grade
              </p>
            </div>
            <span className="text-[10px] text-navy-500">
              Calibrated to your historical loss rates
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {curve.map((c, i) => (
              <div
                key={c.grade}
                className={`rounded-lg px-3 py-2 transition-all duration-700 ${
                  c.current
                    ? "bg-warning/15 border border-warning/40"
                    : "bg-navy-800/40 border border-navy-700/40"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p
                  className={`text-[10px] uppercase font-bold ${c.current ? "text-warning" : "text-navy-500"}`}
                >
                  {c.grade}
                </p>
                <p
                  className={`text-base font-bold tabular-nums ${c.current ? "text-warning" : "text-navy-200"}`}
                >
                  {c.factor.toFixed(2)}×
                </p>
                {c.current && (
                  <p className="text-[9px] uppercase tracking-wider text-warning mt-0.5">
                    This deal
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn show={active} delay={4500}>
        <p className="text-sm text-navy-400 text-center mt-4">
          Three offers, instantly. Underwriter picks one. Merchant gets a
          contract.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE — STATE DISCLOSURE & COMPLIANCE
// ================================================================
export function SceneStateDisclosure({ active }: { active: boolean }) {
  const [stamp, setStamp] = useState(false);
  const [pillsRevealed, setPillsRevealed] = useState(0);
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    if (!active) {
      setStamp(false);
      setPillsRevealed(0);
      setMatched(false);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 5; i++) {
      timers.push(
        setTimeout(
          () => setPillsRevealed((r) => Math.max(r, i + 1)),
          500 + i * 220
        )
      );
    }
    timers.push(setTimeout(() => setMatched(true), 2200));
    timers.push(setTimeout(() => setStamp(true), 4200));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const states = [
    { code: "CA", name: "California", law: "SB 1235 · APR required" },
    { code: "NY", name: "New York", law: "CFDL §801 · APR required", merchant: true },
    { code: "UT", name: "Utah", law: "Commercial Financing Reg" },
    { code: "VA", name: "Virginia", law: "Sales-Based Financing Act" },
    { code: "CT", name: "Connecticut", law: "Commercial Financing Disc" },
  ];

  return (
    <div className="px-6 sm:px-10 py-6 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          State Compliance
        </p>
        <h2 className="text-2xl font-bold text-white mb-4">
          You can&apos;t fund in NY without this. We do it automatically.
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-[1fr_1.1fr] gap-4">
        {/* Left: regulated-states list */}
        <SlideIn show={active} delay={300} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <Scale className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">
                Regulated states detected
              </p>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {states.map((s, i) => {
                const visible = i < pillsRevealed;
                return (
                  <div
                    key={s.code}
                    className={`rounded-lg border px-3 py-2 flex items-center justify-between transition-all duration-500 ${
                      visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1"
                    } ${
                      s.merchant && matched
                        ? "bg-warning/15 border-warning/40 shadow-lg shadow-warning/10"
                        : "bg-navy-800/40 border-navy-700/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-7 w-9 items-center justify-center rounded text-xs font-bold tabular-nums shrink-0 ${
                          s.merchant && matched
                            ? "bg-warning/20 text-warning"
                            : "bg-navy-700/60 text-navy-200"
                        }`}
                      >
                        {s.code}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            s.merchant && matched ? "text-white" : "text-navy-200"
                          }`}
                        >
                          {s.name}
                        </p>
                        <p className="text-[10px] text-navy-500 truncate">
                          {s.law}
                        </p>
                      </div>
                    </div>
                    {s.merchant && matched && (
                      <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning uppercase shrink-0 ml-2">
                        Merchant
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className={`border-t border-profit/30 bg-profit/10 px-4 py-2.5 flex items-center gap-2 transition-opacity duration-500 ${
                matched ? "opacity-100" : "opacity-0"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-profit shrink-0" />
              <p className="text-[11px] text-profit">
                Merchant state{" "}
                <span className="font-bold">NY</span> matched — NY CFDL §801
                applies
              </p>
            </div>
          </div>
        </SlideIn>

        {/* Right: generated disclosure PDF */}
        <SlideIn show={active} delay={500} direction="right">
          <div className="rounded-xl bg-white shadow-2xl shadow-navy-950 overflow-hidden">
            <div className="bg-navy-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-navy-300" />
                <p className="text-[11px] text-navy-200">
                  NY_Disclosure_Sunrise.pdf
                </p>
              </div>
              <span className="text-[10px] text-navy-500">Auto-generated</span>
            </div>
            <div className="p-4 bg-white text-navy-900 text-[10px] leading-relaxed">
              <p className="text-center font-bold text-navy-900 text-xs mb-1">
                COMMERCIAL FINANCING DISCLOSURE
              </p>
              <p className="text-center text-[9px] text-steel-600 mb-3 uppercase tracking-wider">
                State of New York · CFDL §801
              </p>
              <div className="space-y-0.5">
                {[
                  { l: "Amount financed", v: "$35,000.00", d: 1400 },
                  { l: "Total disbursed to recipient", v: "$35,000.00", d: 1550 },
                  { l: "Finance charge", v: "$14,700.00", d: 1700 },
                  { l: "Total payback", v: "$49,700.00", d: 1850 },
                  { l: "Estimated term", v: "5 mo (≈109 ACH debits)", d: 2000 },
                  { l: "APR-equivalent", v: "94.2%", d: 2150, bold: true },
                  { l: "Avg daily payment", v: "$365.00", d: 2300 },
                  { l: "Prepayment", v: "No discount", d: 2450 },
                ].map((row, i) => (
                  <FadeIn key={i} show={active} delay={row.d}>
                    <div className="flex justify-between border-b border-steel-100 py-0.5">
                      <span className="text-steel-700">{row.l}</span>
                      <span
                        className={`tabular-nums ${row.bold ? "font-bold text-navy-900" : "text-navy-800 font-medium"}`}
                      >
                        {row.v}
                      </span>
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* Footer with stamp in its own space */}
              <div className="mt-4 pt-3 border-t border-steel-200 flex items-end justify-between gap-3">
                <div className="text-[9px] text-steel-600 leading-relaxed">
                  <p className="uppercase tracking-wider text-steel-500 text-[8px]">
                    Disclosure provided to
                  </p>
                  <p className="mt-0.5 font-medium text-navy-800">
                    Carlos Reyes
                  </p>
                  <p className="text-steel-600">Sunrise Auto Body LLC</p>
                </div>
                <div
                  className={`rotate-[-8deg] transition-all duration-700 ${
                    stamp
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-150 pointer-events-none"
                  }`}
                >
                  <div className="rounded-md border-2 border-profit px-3 py-1.5 bg-profit/5">
                    <div className="flex items-center gap-1">
                      <Stamp className="h-3 w-3 text-profit" />
                      <p className="text-[9px] font-bold text-profit uppercase tracking-wider">
                        NY CFDL · OK
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={4800}>
        <p className="text-sm text-navy-400 text-center mt-4">
          CA SB 1235 · NY CFDL · UT · VA · CT — generated on every offer.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE — PORTFOLIO INTELLIGENCE / ADMIN COMMAND CENTER
// ================================================================
export function ScenePortfolioIntelligence({ active }: { active: boolean }) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (!active) {
      setRevealed(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 4; i++) {
      timers.push(
        setTimeout(
          () => setRevealed((r) => Math.max(r, i + 1)),
          1600 + i * 200
        )
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const grades = [
    { grade: "A", defaultRate: 2, volume: "$1.4M", color: "bg-profit" },
    { grade: "B", defaultRate: 6, volume: "$1.5M", color: "bg-navy-400" },
    { grade: "C", defaultRate: 12, volume: "$900K", color: "bg-warning" },
    { grade: "D", defaultRate: 28, volume: "$400K", color: "bg-danger" },
  ];

  const brokers = [
    {
      name: "Meridian Funding",
      vol: "$1.8M",
      approve: 64,
      default: 7,
      tone: "ok",
    },
    {
      name: "Atlas Capital",
      vol: "$1.2M",
      approve: 58,
      default: 9,
      tone: "ok",
    },
    {
      name: "Pinnacle Brokers",
      vol: "$780K",
      approve: 51,
      default: 11,
      tone: "neutral",
    },
    {
      name: "Crest Advance",
      vol: "$420K",
      approve: 32,
      default: 24,
      tone: "danger",
    },
  ];

  return (
    <div className="px-6 sm:px-10 py-6 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
              Portfolio Intelligence
            </p>
            <h2 className="text-2xl font-bold text-white">
              Run your shop — not the spreadsheets
            </h2>
          </div>
          <LiveIndicator />
        </div>
      </FadeIn>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "MTD funded",
            value: 4_200_000,
            prefix: "$",
            delay: 200,
            spark: [2.1, 2.4, 2.8, 3.1, 3.0, 3.4, 3.7, 3.9, 3.6, 4.0, 4.1, 4.2] as number[],
            sparkColor: "#16a34a",
          },
          {
            label: "Portfolio default rate",
            value: 8,
            suffix: ".4%",
            delay: 350,
            tone: "warn",
            spark: [9.8, 9.2, 9.0, 8.7, 8.6, 8.4] as number[],
            sparkColor: "#d97706",
          },
          {
            label: "Fraud caught (90d)",
            value: 11,
            delay: 500,
            tone: "ok",
          },
          {
            label: "Loss avoided",
            value: 580_000,
            prefix: "$",
            delay: 650,
            tone: "ok",
          },
        ].map((s, i) => (
          <SlideIn key={i} show={active} delay={s.delay}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-navy-500">
                {s.label}
              </p>
              <p
                className={`mt-1 text-xl font-bold tabular-nums ${
                  s.tone === "ok"
                    ? "text-profit"
                    : s.tone === "warn"
                      ? "text-warning"
                      : "text-white"
                }`}
              >
                <CountUp
                  end={s.value}
                  prefix={s.prefix || ""}
                  suffix={s.suffix || ""}
                  show={active}
                  delay={s.delay + 200}
                />
              </p>
              {s.spark && (
                <MiniSparkline
                  data={s.spark}
                  color={s.sparkColor || "#4169a5"}
                  className="mt-2"
                  height={14}
                />
              )}
            </div>
          </SlideIn>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Default rate by grade */}
        <SlideIn show={active} delay={900}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">
                Default rate by paper grade
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {grades.map((g, i) => (
                <div key={g.grade}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-5 text-center font-bold text-white">
                        {g.grade}
                      </span>
                      <span className="text-navy-500 text-[11px]">
                        {g.volume}
                      </span>
                    </div>
                    <span className="font-bold tabular-nums text-white">
                      <CountUp
                        end={g.defaultRate}
                        suffix="%"
                        show={active}
                        delay={1500 + i * 200}
                      />
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-navy-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-[1500ms] ease-out ${g.color}`}
                      style={{
                        width: active ? `${g.defaultRate * 3}%` : "0%",
                        transitionDelay: `${1200 + i * 200}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SlideIn>

        {/* Broker scorecard */}
        <SlideIn show={active} delay={1100}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-navy-300" />
                <p className="text-sm font-semibold text-white">
                  Broker scorecard
                </p>
              </div>
              <span className="text-[10px] text-navy-500">90-day window</span>
            </div>
            <div className="px-2 py-1">
              <table className="w-full text-xs">
                <thead className="text-[10px] text-navy-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-2 py-1.5">Broker</th>
                    <th className="text-right px-2 py-1.5">Volume</th>
                    <th className="text-right px-2 py-1.5">Approve</th>
                    <th className="text-right px-2 py-1.5">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {brokers.map((b, i) => (
                    <tr
                      key={b.name}
                      className={`border-t border-navy-800/40 transition-opacity duration-500 ${
                        i < revealed ? "opacity-100" : "opacity-0"
                      } ${b.tone === "danger" ? "bg-danger/5" : ""}`}
                    >
                      <td className="px-2 py-1.5 text-navy-200 font-medium">
                        {b.name}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-white">
                        {b.vol}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-navy-300">
                        {b.approve}%
                      </td>
                      <td
                        className={`px-2 py-1.5 text-right tabular-nums font-semibold ${
                          b.tone === "danger" ? "text-danger" : "text-navy-300"
                        }`}
                      >
                        {b.default}%
                        {b.tone === "danger" && (
                          <TrendingUp className="inline h-3 w-3 ml-1" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <FadeIn show={active} delay={2700}>
              <div className="border-t border-danger/20 bg-danger/5 px-4 py-2 text-[11px] text-danger flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                Crest Advance default rate is 3.4× portfolio average — review
                relationship.
              </div>
            </FadeIn>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={3500}>
        <p className="text-sm text-navy-400 text-center mt-4">
          Pricing tuned to grade. Broker quality measured. Every loss caught
          is a dollar earned.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE — CROSS-PORTFOLIO ANOMALY CATCH
// ================================================================
export function SceneAnomalyCatch({ active }: { active: boolean }) {
  const [revealed, setRevealed] = useState(0);
  const [rowsRevealed, setRowsRevealed] = useState(0);
  useEffect(() => {
    if (!active) {
      setRevealed(0);
      setRowsRevealed(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setRevealed(1), 1400));
    timers.push(setTimeout(() => setRevealed(2), 2300));
    timers.push(setTimeout(() => setRevealed(3), 3300));
    timers.push(setTimeout(() => setRevealed(4), 4200));
    for (let i = 0; i < 3; i++) {
      timers.push(
        setTimeout(
          () => setRowsRevealed((r) => Math.max(r, i + 1)),
          1100 + i * 350
        )
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const applications = [
    {
      when: "2026-03-04",
      ein: "12-3456789",
      legal: "Sunrise Auto Body LLC",
      broker: "Eastline",
      amount: "$50K",
      status: "Pending",
    },
    {
      when: "2026-02-12",
      ein: "47-1234567",
      legal: "S.A.B. Holdings LLC",
      broker: "Eastline",
      amount: "$45K",
      status: "Declined",
    },
    {
      when: "2026-01-28",
      ein: "88-9876543",
      legal: "Reyes Family Auto Inc",
      broker: "Vanguard",
      amount: "$60K",
      status: "Withdrawn",
    },
  ];

  return (
    <div className="px-6 sm:px-10 py-6 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          Cross-Portfolio Intelligence
        </p>
        <h2 className="text-2xl font-bold text-white mb-4">
          The platform learns your book.
        </h2>
      </FadeIn>

      {/* Big alert banner */}
      <SlideIn show={active} delay={300}>
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-5 py-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20 ring-2 ring-danger/40 animate-pulse">
              <AlertOctagon className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-danger">
                Pattern match detected
              </p>
              <p className="text-xs text-navy-200 mt-0.5">
                3 applications · 60 days · 1 person · 3 EINs · 2 brokers
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-danger/15 px-3 py-1 text-[10px] font-bold text-danger">
            <Network className="h-3 w-3" />
            Auto-blocked
          </div>
        </div>
      </SlideIn>

      <div className="grid sm:grid-cols-[1fr_1.2fr] gap-4">
        {/* Match dimensions */}
        <SlideIn show={active} delay={500} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <Eye className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">
                What we matched on
              </p>
            </div>
            <div className="px-5 py-3 space-y-2.5 text-xs">
              {[
                {
                  icon: KeyRound,
                  label: "SSN (PG)",
                  value: "###-##-1234",
                  match: true,
                  d: 800,
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "carlos.reyes@gmail.com",
                  match: true,
                  d: 1000,
                },
                {
                  icon: Banknote,
                  label: "Routing + acct mask",
                  value: "021000021 / ••4242",
                  match: true,
                  d: 1200,
                },
                {
                  icon: Building2,
                  label: "Business address",
                  value: "1847 Atlantic Ave, Brooklyn",
                  match: true,
                  d: 1400,
                },
                {
                  icon: FileText,
                  label: "EIN",
                  value: "3 different — 47-… / 88-… / 12-…",
                  match: false,
                  d: 1600,
                },
                {
                  icon: Briefcase,
                  label: "Legal name",
                  value: "3 different (Reyes, S.A.B., Sunrise)",
                  match: false,
                  d: 1800,
                },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <FadeIn key={i} show={active} delay={row.d}>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${row.match ? "text-danger" : "text-navy-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-navy-500">
                          {row.label}
                        </p>
                        <p className="text-navy-200 truncate">{row.value}</p>
                      </div>
                      {row.match ? (
                        <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[9px] font-bold text-danger">
                          MATCH
                        </span>
                      ) : (
                        <span className="rounded bg-navy-800 px-1.5 py-0.5 text-[9px] font-bold text-navy-400">
                          DIFF
                        </span>
                      )}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </SlideIn>

        {/* Timeline of applications */}
        <SlideIn show={active} delay={700} direction="right">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <Clock className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">
                Application history — same person
              </p>
            </div>
            <div className="px-3 py-2">
              <table className="w-full text-xs">
                <thead className="text-[10px] text-navy-500 uppercase tracking-wider">
                  <tr>
                    <th className="w-4"></th>
                    <th className="text-left px-2 py-1.5">Date</th>
                    <th className="text-left px-2 py-1.5">Legal</th>
                    <th className="text-left px-2 py-1.5 hidden sm:table-cell">
                      EIN
                    </th>
                    <th className="text-right px-2 py-1.5">Amt</th>
                    <th className="text-left px-2 py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a, i) => (
                    <tr
                      key={i}
                      className={`border-t border-navy-800/30 transition-opacity duration-500 ${
                        i < rowsRevealed ? "opacity-100" : "opacity-0"
                      } ${i === 0 ? "bg-danger/10" : ""}`}
                    >
                      {/* Connecting-thread cell — vertical line + dot */}
                      <td className="relative w-4 align-middle">
                        {/* Vertical line — top half except for first row, bottom half except for last */}
                        {i > 0 && (
                          <span
                            className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-danger/40"
                          />
                        )}
                        {i < applications.length - 1 && (
                          <span
                            className="absolute left-1/2 bottom-0 h-1/2 w-px -translate-x-1/2 bg-danger/40"
                          />
                        )}
                        {/* Dot */}
                        <span
                          className={`relative block h-2 w-2 mx-auto rounded-full ${
                            i === 0
                              ? "bg-danger ring-2 ring-danger/30"
                              : "bg-danger/60"
                          }`}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-navy-300 tabular-nums">
                        {a.when}
                      </td>
                      <td className="px-2 py-1.5 text-white font-medium truncate max-w-[140px]">
                        {a.legal}
                        {i === 0 && (
                          <span className="ml-1.5 rounded bg-danger/20 px-1 py-0.5 text-[9px] font-bold text-danger uppercase">
                            Now
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-navy-400 hidden sm:table-cell tabular-nums">
                        {a.ein}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-white">
                        {a.amount}
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            a.status === "Declined"
                              ? "bg-danger/20 text-danger"
                              : a.status === "Withdrawn"
                                ? "bg-navy-700 text-navy-300"
                                : "bg-warning/20 text-warning"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {revealed >= 4 && (
              <FadeIn show={active} delay={0}>
                <div className="border-t border-danger/20 bg-danger/5 px-4 py-2 text-[11px] text-danger flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3" />
                  $50K loss prevented. Brokers Eastline + Vanguard flagged for
                  review.
                </div>
              </FadeIn>
            )}
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={5000}>
        <p className="text-sm text-navy-400 text-center mt-4">
          Same SSN. Different EINs. Different brokers. Caught before funding.
        </p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE — DATAMERCH DEEP DIVE
// ================================================================
export function SceneDataMerch({ active }: { active: boolean }) {
  const [hitShown, setHitShown] = useState(false);
  const [hitsRevealed, setHitsRevealed] = useState(0);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    if (!active) {
      setHitShown(false);
      setHitsRevealed(0);
      setDeclined(false);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setHitShown(true), 2400));
    for (let i = 0; i < 3; i++) {
      timers.push(
        setTimeout(
          () => setHitsRevealed((r) => Math.max(r, i + 1)),
          2900 + i * 700
        )
      );
    }
    timers.push(setTimeout(() => setDeclined(true), 5400));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const hits = [
    {
      funder: "Funder #214",
      date: "2024-11-12",
      category: "DEFAULT",
      detail:
        "Stopped ACH after $17K disbursed · $32,400 outstanding · no contact since",
      severity: "critical" as const,
    },
    {
      funder: "Funder #481",
      date: "2024-08-04",
      category: "SUSPICIOUS",
      detail:
        "Switched bank accounts mid-deal · new account in spouse's name",
      severity: "high" as const,
    },
    {
      funder: "Funder #103",
      date: "2024-06-22",
      category: "SLOW PAYER",
      detail: "Required reverse consolidation · 8 missed payments · settled",
      severity: "med" as const,
    },
  ];

  return (
    <div className="px-6 sm:px-10 py-6 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">
          DataMerch · Industry Shared Intelligence
        </p>
        <h2 className="text-2xl font-bold text-white mb-4">
          The blacklist every MCA shop reads — and contributes to.
        </h2>
      </FadeIn>

      {/* Stats strip — verifiable facts only, no fabricated numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Funder members",
            delay: 200,
            numeric: { value: 180, suffix: "+" },
          },
          {
            label: "Merchant records",
            delay: 350,
            numeric: { value: 100_000, suffix: "+" },
          },
          {
            label: "Established",
            delay: 500,
            text: "2015",
          },
          {
            label: "Lookup",
            delay: 650,
            text: "Real-time · EIN",
          },
        ].map((s, i) => (
          <SlideIn key={i} show={active} delay={s.delay}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-navy-500">
                {s.label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-white">
                {s.numeric ? (
                  <CountUp
                    end={s.numeric.value}
                    suffix={s.numeric.suffix || ""}
                    show={active}
                    delay={s.delay + 200}
                  />
                ) : (
                  s.text
                )}
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      <div className="grid sm:grid-cols-[1fr_1.4fr] gap-4">
        {/* Left: how-it-works flow with animated pulses */}
        <SlideIn show={active} delay={900} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden h-full">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center gap-2">
              <Database className="h-4 w-4 text-navy-300" />
              <p className="text-sm font-semibold text-white">How it works</p>
            </div>
            <div className="relative px-4 py-4">
              {/* Animated connector overlay: down-pulses (data in) + up-pulses (contribute back) */}
              <svg
                viewBox="0 0 10 100"
                preserveAspectRatio="none"
                className="absolute left-0 top-0 h-full"
                style={{ width: 24, left: "50%", marginLeft: -12, pointerEvents: "none" }}
              >
                {/* Vertical guide line */}
                <line
                  x1="5" y1="22" x2="5" y2="78"
                  stroke="#273f63" strokeWidth="0.3" strokeOpacity="0.5"
                />
                {/* Downward pulses (funders → registry → platform) */}
                <circle r="0.9" fill="#8da5c9">
                  <animate attributeName="cy" from="22" to="48" dur="1.8s" begin="0s" repeatCount="indefinite" />
                  <animate attributeName="cx" values="5;5" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r="0.9" fill="#8da5c9">
                  <animate attributeName="cy" from="52" to="78" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                  <animate attributeName="cx" values="5;5" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                </circle>
                {/* Upward pulse (platform → registry: contribute back) — slower, green */}
                <circle r="0.7" fill="#16a34a">
                  <animate attributeName="cy" from="78" to="52" dur="3.4s" begin="1.5s" repeatCount="indefinite" />
                  <animate attributeName="cx" values="7;7" dur="3.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="3.4s" begin="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>

              <div className="flex flex-col items-stretch gap-3 relative">
                <div className="rounded-lg bg-navy-800/40 border border-navy-700/40 px-4 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-navy-500">
                    180+ funders
                  </p>
                  <p className="text-sm font-semibold text-navy-100 mt-0.5">
                    Report bad actors
                  </p>
                </div>
                <div className="rounded-lg bg-navy-700/50 border border-navy-500/40 px-4 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-navy-300">
                    DataMerch registry
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    Shared · EIN-keyed
                  </p>
                </div>
                <div className="rounded-lg bg-profit/10 border border-profit/40 px-4 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-profit/80">
                    Your platform
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    Queries every deal
                  </p>
                  <p className="text-[10px] text-profit mt-0.5">
                    Auto-contributes back on funding
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Right: live query, war-story style */}
        <SlideIn show={active} delay={1100} direction="right">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
            <div className="bg-navy-800/50 px-4 py-2.5 border-b border-navy-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-navy-300" />
                <p className="text-sm font-semibold text-white">
                  Last Tuesday — a different deal
                </p>
              </div>
              <span className="text-[10px] text-navy-500">
                Live query
              </span>
            </div>
            <div className="px-4 py-3">
              {/* Deal context */}
              <div className="rounded-md bg-navy-800/40 border border-navy-700/40 px-3 py-2 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-white">
                    Coastal Marine LLC
                  </p>
                  <p className="text-sm text-navy-200 tabular-nums">
                    $80,000
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "A-paper statements",
                    "FICO 712",
                    "UCC clear",
                    "OFAC clear",
                    "KYB ✓",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-profit/10 border border-profit/20 px-1.5 py-0.5 text-[9px] font-semibold text-profit"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-navy-500 italic">
                  Everything else looked fine.
                </p>
              </div>

              {/* HIT badge */}
              <div
                className={`flex items-center justify-between mb-2 transition-opacity duration-500 ${
                  hitShown ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-[11px] uppercase tracking-wider text-navy-400 font-semibold">
                  DataMerch result
                </p>
                <span className="rounded-full bg-danger/15 border border-danger/30 px-2.5 py-0.5 text-[11px] font-bold text-danger flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3" />
                  HIT · 3 entries
                </span>
              </div>

              {/* Hits */}
              <div className="space-y-1.5">
                {hits.map((h, i) => {
                  const visible = i < hitsRevealed;
                  const borderClass =
                    h.severity === "critical"
                      ? "border-danger/40 bg-danger/10"
                      : h.severity === "high"
                        ? "border-warning/40 bg-warning/10"
                        : "border-navy-700/50 bg-navy-800/40";
                  const badgeClass =
                    h.severity === "critical"
                      ? "bg-danger/30 text-danger"
                      : h.severity === "high"
                        ? "bg-warning/30 text-warning"
                        : "bg-navy-700 text-navy-200";
                  return (
                    <div
                      key={i}
                      className={`rounded-md border px-3 py-2 transition-all duration-500 ${
                        visible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-1"
                      } ${borderClass}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-navy-400">
                            {h.funder}
                          </span>
                          <span className="text-[10px] text-navy-500 tabular-nums">
                            {h.date}
                          </span>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}
                        >
                          {h.category}
                        </span>
                      </div>
                      <p className="text-xs text-navy-100 leading-snug">
                        {h.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Final callout */}
              <div
                className={`mt-3 rounded-lg border border-profit/40 bg-profit/10 px-3 py-2.5 flex items-center gap-2 transition-all duration-500 ${
                  declined
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1"
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-profit shrink-0" />
                <p className="text-xs">
                  <span className="font-bold text-profit">Declined.</span>{" "}
                  <span className="text-navy-100">
                    $80,000 loss avoided. Would have passed every other check.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={6300}>
        <p className="text-sm text-navy-400 text-center mt-4">
          The most important data source in MCA. Cheap. Industry-standard.
          Wired in by default.
        </p>
      </FadeIn>
    </div>
  );
}
