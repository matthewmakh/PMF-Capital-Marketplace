"use client";
import { FadeIn, SlideIn, CountUp, ProgressFill } from "./animations";
import { useState, useEffect, useRef } from "react";
import {
  DollarSign, TrendingUp, Users, Briefcase, Shield, ShieldCheck,
  MapPin, Clock, AlertTriangle, CheckCircle2, ArrowUpRight,
  FileText, Wallet, BarChart3, CircleDollarSign, KeyRound,
  Mail, Inbox, Activity,
} from "lucide-react";

// ================================================================
// SHARED: Reusable animation helpers
// ================================================================
function Shimmer({ active, delay = 0, className = "" }: { active: boolean; delay?: number; className?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  if (!show) return null;
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-full pointer-events-none ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          animation: "shimmer 2.5s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

function LiveDot({ active, delay = 0 }: { active: boolean; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1.5 ml-3">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
    </span>
  );
}

function Sparkline({ active, delay = 0 }: { active: boolean; delay?: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!active) { setDrawn(false); return; }
    const t = setTimeout(() => setDrawn(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  const points = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14, 12, 15];
  const path = points.map((y, i) => `${i === 0 ? "M" : "L"} ${i * 5} ${18 - y}`).join(" ");

  return (
    <svg viewBox="0 0 55 18" className="w-14 h-4 ml-auto" style={{ opacity: drawn ? 1 : 0, transition: "opacity 0.5s" }}>
      <path
        d={path}
        fill="none"
        stroke="rgba(52,211,153,0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 100,
          strokeDashoffset: drawn ? 0 : 100,
          transition: "stroke-dashoffset 2s ease-out",
        }}
      />
    </svg>
  );
}

function TypeWriter({ text, active, delay = 0, className = "" }: { text: string; active: boolean; delay?: number; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    const timeout = setTimeout(() => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length && intervalRef.current) clearInterval(intervalRef.current);
      }, 18);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, delay, text]);

  return <span className={className}>{displayed}<span className="animate-pulse">▎</span></span>;
}

// ================================================================
// SCENE 1: HERO — CAPITAL FLOW CONSTELLATION
// ================================================================
const MERCHANTS = [
  { name: "Metro Quick Mart", daily: "$375/day", x: 15, y: 12 },
  { name: "Bella's Kitchen", daily: "$280/day", x: 50, y: 7 },
  { name: "Greenfield Medical", daily: "$450/day", x: 85, y: 12 },
];
const INVESTORS = [
  { name: "Michael Torres", earned: "+$12,400", initials: "MT", x: 15, y: 72 },
  { name: "Jessica Park", earned: "+$8,200", initials: "JP", x: 50, y: 77 },
  { name: "David Kim", earned: "+$6,100", initials: "DK", x: 85, y: 72 },
];
const HUB = { x: 50, y: 40 };

export function SceneHero({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 overflow-hidden">
      <div className="relative w-full max-w-2xl" style={{ height: "70vh", maxHeight: 520 }}>
        {active && (
          <style>{`
            ${MERCHANTS.map((m, i) => `
              @keyframes flow-m${i} {
                0% { left: ${m.x}%; top: ${m.y + 5}%; opacity: 0; }
                12% { opacity: 1; }
                88% { opacity: 1; }
                100% { left: ${HUB.x}%; top: ${HUB.y - 2}%; opacity: 0; }
              }
            `).join("")}
            ${INVESTORS.map((inv, i) => `
              @keyframes flow-i${i} {
                0% { left: ${HUB.x}%; top: ${HUB.y + 5}%; opacity: 0; }
                12% { opacity: 1; }
                88% { opacity: 1; }
                100% { left: ${inv.x}%; top: ${inv.y - 2}%; opacity: 0; }
              }
            `).join("")}
            @keyframes pulse-ring {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 0.25; }
              100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
            }
          `}</style>
        )}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: active ? 1 : 0, transition: "opacity 1.2s ease-out 0.5s" }}>
          {MERCHANTS.map((m, i) => (<line key={`ml-${i}`} x1={m.x} y1={m.y + 5} x2={HUB.x} y2={HUB.y - 2} stroke="rgba(71,85,105,0.25)" strokeWidth="1" vectorEffect="non-scaling-stroke" />))}
          {INVESTORS.map((inv, i) => (<line key={`il-${i}`} x1={HUB.x} y1={HUB.y + 5} x2={inv.x} y2={inv.y - 2} stroke="rgba(71,85,105,0.25)" strokeWidth="1" vectorEffect="non-scaling-stroke" />))}
        </svg>
        {active && [0, 1, 2].map((i) => (
          <div key={`ring-${i}`} className="absolute w-20 h-20 rounded-full border border-navy-500/25 pointer-events-none" style={{ left: `${HUB.x}%`, top: `${HUB.y}%`, animation: `pulse-ring 3.5s ${i * 1.2}s ease-out infinite` }} />
        ))}
        {active && MERCHANTS.flatMap((_, i) => [0, 1, 2].map((d) => (
          <div key={`md-${i}-${d}`} className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 pointer-events-none opacity-0" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)", animation: `flow-m${i} 2.8s ${1000 + i * 200 + d * 900}ms ease-in-out infinite`, transform: "translate(-50%, -50%)" }} />
        )))}
        {active && INVESTORS.flatMap((_, i) => [0, 1, 2].map((d) => (
          <div key={`id-${i}-${d}`} className="absolute w-1.5 h-1.5 rounded-full bg-sky-400 pointer-events-none opacity-0" style={{ boxShadow: "0 0 6px rgba(56,189,248,0.8)", animation: `flow-i${i} 2.8s ${1800 + i * 200 + d * 900}ms ease-in-out infinite`, transform: "translate(-50%, -50%)" }} />
        )))}
        {MERCHANTS.map((m, i) => (
          <div key={`m-${i}`} className="absolute" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}>
            <FadeIn show={active} delay={300 + i * 200}>
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-navy-800/80 border border-navy-600/40 flex items-center justify-center backdrop-blur-sm"><Briefcase className="h-4 w-4 text-navy-400" /></div>
                <p className="text-[10px] text-navy-400 mt-1.5 text-center whitespace-nowrap">{m.name}</p>
                <p className="text-[10px] text-emerald-400/80 font-semibold hidden sm:block">{m.daily}</p>
              </div>
            </FadeIn>
          </div>
        ))}
        <div className="absolute" style={{ left: `${HUB.x}%`, top: `${HUB.y}%`, transform: "translate(-50%, -50%)" }}>
          <FadeIn show={active} delay={0}>
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center shadow-2xl shadow-navy-500/30 border border-navy-400/20">
                <CircleDollarSign className="h-9 w-9 text-white" />
              </div>
              <div className="mt-2.5 text-center">
                <p className="text-[10px] uppercase tracking-widest text-navy-500">Total Distributed</p>
                <p className="text-lg font-bold text-white tabular-nums">$<CountUp end={2400000} show={active} delay={800} /></p>
              </div>
            </div>
          </FadeIn>
        </div>
        {INVESTORS.map((inv, i) => (
          <div key={`i-${i}`} className="absolute" style={{ left: `${inv.x}%`, top: `${inv.y}%`, transform: "translate(-50%, -50%)" }}>
            <FadeIn show={active} delay={1200 + i * 200}>
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-navy-800/80 border border-navy-600/40 flex items-center justify-center backdrop-blur-sm"><span className="text-xs font-bold text-navy-300">{inv.initials}</span></div>
                <p className="text-[10px] text-navy-400 mt-1.5 text-center whitespace-nowrap">{inv.name}</p>
                <p className="text-[10px] text-sky-400/80 font-semibold hidden sm:block">{inv.earned}</p>
              </div>
            </FadeIn>
          </div>
        ))}
      </div>
      <div className="text-center -mt-6">
        <FadeIn show={active} delay={2200}><h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Capital Marketplace</h1></FadeIn>
        <FadeIn show={active} delay={2600}><p className="text-base text-navy-300/70 max-w-lg mx-auto">Internal Syndication & Portfolio Management Platform</p></FadeIn>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 2: ADMIN DASHBOARD — Live pulse + sparkline
// ================================================================
export function SceneAdminDashboard({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center mb-1">
          <p className="text-xs uppercase tracking-widest text-navy-400">Admin Dashboard</p>
          <LiveDot active={active} delay={1000} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-6">Office Command Center</h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Capital Deployed", value: 2400000, prefix: "$", icon: DollarSign, color: "text-white", sparkline: false },
          { label: "Total Collected", value: 1800000, prefix: "$", icon: TrendingUp, color: "text-profit", sparkline: true },
          { label: "Active Deals", value: 12, icon: Briefcase, color: "text-white", sparkline: false },
          { label: "Active Users", value: 8, icon: Users, color: "text-white", sparkline: false },
        ].map((card, i) => (
          <SlideIn key={i} show={active} delay={300 + i * 200}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-navy-400">{card.label}</span>
                <card.icon className="h-4 w-4 text-navy-500" />
              </div>
              <div className="flex items-end justify-between">
                <p className={`text-xl font-bold tabular-nums ${card.color}`}>
                  <CountUp end={card.value} prefix={card.prefix || ""} show={active} delay={500 + i * 200} />
                </p>
                {card.sparkline && <Sparkline active={active} delay={1200} />}
              </div>
            </div>
          </SlideIn>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SlideIn show={active} delay={1200}>
          <div className="flex items-center gap-3 rounded-xl bg-navy-800/50 border border-navy-600/30 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700"><FileText className="h-4 w-4 text-navy-300" /></div>
            <div><p className="text-sm font-semibold text-navy-200">3 deals pending review</p><p className="text-xs text-navy-500">Click to review</p></div>
          </div>
        </SlideIn>
        <SlideIn show={active} delay={1400}>
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20"><AlertTriangle className="h-4 w-4 text-amber-400" /></div>
            <div><p className="text-sm font-semibold text-amber-300">1 delinquent deal</p><p className="text-xs text-amber-500/70">Requires attention</p></div>
          </div>
        </SlideIn>
        <SlideIn show={active} delay={1600}>
          <div className="flex items-center gap-3 rounded-xl bg-navy-800/50 border border-navy-600/30 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700"><Wallet className="h-4 w-4 text-navy-300" /></div>
            <div><p className="text-sm font-semibold text-navy-200">2 payouts awaiting</p><p className="text-xs text-navy-500">Click to review</p></div>
          </div>
        </SlideIn>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 3: EMAIL INGESTION — Scanning beam
// ================================================================
export function SceneEmailIngestion({ active }: { active: boolean }) {
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    if (!active) { setScanning(false); return; }
    const t = setTimeout(() => setScanning(true), 800);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Deal Intake</p>
        <h2 className="text-2xl font-bold text-white mb-6">Email → Pipeline in Seconds</h2>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-6 items-start">
        <SlideIn show={active} delay={300} direction="left">
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden relative">
            {/* Scanning beam */}
            {scanning && (
              <>
                <style>{`
                  @keyframes scan-beam {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                `}</style>
                <div className="absolute left-0 right-0 h-8 pointer-events-none z-10" style={{ animation: "scan-beam 3s ease-in-out infinite", background: "linear-gradient(180deg, transparent 0%, rgba(52,211,153,0.12) 50%, transparent 100%)" }}>
                  <div className="h-px w-full bg-emerald-400/40" />
                </div>
              </>
            )}
            <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700/30 flex items-center gap-3">
              <Mail className="h-4 w-4 text-navy-400" />
              <div>
                <p className="text-sm font-semibold text-white">New Deal Submission</p>
                <p className="text-[11px] text-navy-500">From: broker@meridianfunding.com</p>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-xs text-navy-400 mb-3">Subject: <span className="text-navy-200">New Deal — Greenfield Medical Supply</span></p>
              <div className="rounded-lg bg-navy-800/50 px-3 py-3 text-xs text-navy-300 leading-relaxed">
                <p>Hi team,</p>
                <p className="mt-2">Submitting a new deal for review:</p>
                <p className="mt-2">
                  <span className="text-white font-medium">Merchant:</span> Greenfield Medical Supply<br />
                  <span className="text-white font-medium">Amount:</span> $60,000<br />
                  <span className="text-white font-medium">Factor Rate:</span> 1.30x<br />
                  <span className="text-white font-medium">Term:</span> 180 days<br />
                  <span className="text-white font-medium">Industry:</span> Healthcare
                </p>
                <p className="mt-2 text-navy-500">Please review and publish when ready.</p>
              </div>
            </div>
          </div>
        </SlideIn>

        <div>
          <FadeIn show={active} delay={800}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-navy-700/50" />
              <div className="flex items-center gap-1.5 rounded-full bg-navy-800 border border-navy-700/50 px-3 py-1">
                <Inbox className="h-3.5 w-3.5 text-navy-400" />
                <span className="text-[11px] text-navy-400 font-medium">Auto-Parsed</span>
              </div>
              <div className="h-px flex-1 bg-navy-700/50" />
            </div>
          </FadeIn>

          <SlideIn show={active} delay={900} direction="right">
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
              <p className="text-xs uppercase tracking-wider text-navy-500 mb-3">Extracted Deal Data</p>
              {[
                { label: "Merchant", value: "Greenfield Medical Supply", delay: 1200 },
                { label: "Funding Amount", value: "$60,000", delay: 1500 },
                { label: "Factor Rate", value: "1.30x", delay: 1800 },
                { label: "Term", value: "180 days", delay: 2100 },
                { label: "Industry", value: "Healthcare", delay: 2400 },
              ].map((field, i) => (
                <FadeIn key={i} show={active} delay={field.delay}>
                  <div className="flex justify-between py-1.5 border-b border-navy-800/30 last:border-0">
                    <span className="text-xs text-navy-500">{field.label}</span>
                    <span className="text-sm font-medium text-white">{field.value}</span>
                  </div>
                </FadeIn>
              ))}
              <FadeIn show={active} delay={2800}>
                <div className="flex items-center gap-2 rounded-lg bg-profit/10 border border-profit/20 px-3 py-2 mt-3">
                  <CheckCircle2 className="h-4 w-4 text-profit" />
                  <span className="text-sm text-profit font-medium">Added to Pipeline</span>
                </div>
              </FadeIn>
            </div>
          </SlideIn>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 4: DEAL MARKETPLACE — Shimmer + OPEN pulse + invest animation
// ================================================================
export function SceneDealMarketplace({ active }: { active: boolean }) {
  const [invested, setInvested] = useState(false);
  useEffect(() => {
    if (!active) { setInvested(false); return; }
    const t = setTimeout(() => setInvested(true), 2800);
    return () => clearTimeout(t);
  }, [active]);

  const deals = [
    { name: "Metro Quick Mart LLC", industry: "Retail", state: "NY", amount: 50000, factor: 1.35, filled: 81, returnPct: 35, investors: 3 },
    { name: "Bella's Italian Kitchen", industry: "Restaurant", state: "NJ", amount: 35000, factor: 1.35, filled: 96, returnPct: 35, investors: 4 },
    { name: "Greenfield Medical Supply", industry: "Healthcare", state: "MA", amount: 60000, factor: 1.30, filled: 45, returnPct: 30, investors: 1 },
  ];
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Deal Marketplace</p>
        <h2 className="text-2xl font-bold text-white mb-6">Live Syndication Opportunities</h2>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-3">
        {deals.map((d, i) => {
          const isTarget = i === 2;
          const fillValue = isTarget && invested ? 53 : d.filled;
          const investorCount = isTarget && invested ? 2 : d.investors;
          return (
            <SlideIn key={i} show={active} delay={400 + i * 300}>
              <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden relative">
                <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{d.name}</h3>
                      {d.filled < 100 && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                      )}
                    </div>
                    <span className="rounded-md bg-profit/15 px-2 py-0.5 text-xs font-bold text-profit">{d.returnPct}%</span>
                  </div>
                  <div className="mt-1 flex gap-2 text-[11px] text-navy-400">
                    <span className="flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{d.industry}</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{d.state}</span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-2 gap-2 text-center mb-3">
                    <div className="rounded-lg bg-navy-800/70 px-2 py-1.5">
                      <p className="text-[10px] uppercase text-navy-500">Amount</p>
                      <p className="text-sm font-bold text-white">${(d.amount / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="rounded-lg bg-navy-800/70 px-2 py-1.5">
                      <p className="text-[10px] uppercase text-navy-500">Factor</p>
                      <p className="text-sm font-bold text-white">{d.factor}x</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-navy-400 flex items-center gap-1"><Users className="h-3 w-3" />{investorCount}</span>
                    <span className={`font-bold ${fillValue >= 90 ? "text-profit" : "text-navy-300"}`}>
                      <CountUp end={fillValue} suffix="%" show={active} delay={1000 + i * 300} />
                    </span>
                  </div>
                  <div className="relative">
                    <ProgressFill value={fillValue} delay={800 + i * 300} color={fillValue >= 90 ? "bg-profit" : "bg-navy-500"} show={active} />
                    <Shimmer active={active} delay={2000 + i * 300} className="rounded-full" />
                  </div>
                  {isTarget && (
                    <div className={`mt-3 flex items-center gap-2 rounded-lg bg-profit/10 border border-profit/20 px-3 py-2 transition-all duration-700 ${invested ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                      <CircleDollarSign className="h-4 w-4 text-profit" />
                      <span className="text-xs text-profit font-semibold">Invested $5,000</span>
                    </div>
                  )}
                </div>
              </div>
            </SlideIn>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// SCENE 5: DEAL DETAIL — Shimmer + payment tick
// ================================================================
export function SceneDealDetail({ active }: { active: boolean }) {
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    if (!active) { setTicked(false); return; }
    const t = setTimeout(() => setTicked(true), 4000);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Deal Detail</p>
        <h2 className="text-2xl font-bold text-white mb-2">Metro Quick Mart LLC</h2>
        <div className="flex gap-3 text-xs text-navy-400 mb-5">
          <span className="rounded-full bg-profit/15 px-2 py-0.5 text-profit font-semibold">Active — Repaying</span>
          <span>Retail</span><span>NY</span><span>180-day term</span>
        </div>
      </FadeIn>

      <SlideIn show={active} delay={400}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-px rounded-xl overflow-hidden bg-navy-700/30 mb-5">
          {[
            { label: "Funded", value: "$50,000" }, { label: "Payback", value: "$67,500" },
            { label: "Factor", value: "1.35x" }, { label: "Return", value: "35%", color: "text-profit" },
            { label: "Collected", value: ticked ? "$42,375" : "$42,000", color: "text-profit" }, { label: "Remaining", value: ticked ? "$25,125" : "$25,500" },
          ].map((c, i) => (
            <div key={i} className="bg-navy-900/80 px-3 py-3 text-center">
              <p className="text-[10px] uppercase text-navy-500">{c.label}</p>
              <p className={`text-sm font-bold mt-0.5 transition-all duration-700 ${c.color || "text-white"}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </SlideIn>

      <SlideIn show={active} delay={800}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 px-5 py-4 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-navy-300 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-navy-500" />Repayment Progress</span>
            <span className="font-bold text-navy-200 tabular-nums transition-all duration-700">{ticked ? "63%" : "62%"}</span>
          </div>
          <div className="relative">
            <ProgressFill value={ticked ? 63 : 62} delay={1000} color="bg-navy-400" show={active} className="h-3" />
            <Shimmer active={active} delay={1800} className="rounded-full" />
          </div>
          <div className="flex justify-between text-xs mt-2 text-navy-500">
            <span>Principal: {ticked ? "85" : "84"}% recovered</span>
            <span>~{ticked ? "23" : "24"} payments to break-even</span>
          </div>
          {ticked && (
            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400 animate-pulse">
              <Activity className="h-3 w-3" />
              <span>Payment received — +$375.00</span>
            </div>
          )}
        </div>
      </SlideIn>

      <div className="grid sm:grid-cols-2 gap-4">
        <SlideIn show={active} delay={1400}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
            <p className="text-xs uppercase tracking-wider text-navy-500 mb-3">Syndicate</p>
            {[
              { name: "Michael Torres", pct: 60, amount: "$30,000", returned: "$25,200" },
              { name: "Jessica Park", pct: 40, amount: "$20,000", returned: "$16,800" },
            ].map((inv, i) => (
              <FadeIn key={i} show={active} delay={1800 + i * 300}>
                <div className="flex items-center gap-3 py-2 border-b border-navy-800/50 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-navy-700 flex items-center justify-center text-xs font-bold text-navy-300">{inv.name.split(" ").map(n => n[0]).join("")}</div>
                  <div className="flex-1"><p className="text-sm font-medium text-white">{inv.name}</p><p className="text-xs text-navy-500">{inv.pct}% ownership</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-white">{inv.amount}</p><p className="text-xs text-profit">+{inv.returned}</p></div>
                </div>
              </FadeIn>
            ))}
          </div>
        </SlideIn>

        <SlideIn show={active} delay={1600}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
            <p className="text-xs uppercase tracking-wider text-navy-500 mb-3">Deal Health</p>
            {[
              { label: "Collection Rate", value: ticked ? "63.0%" : "62.2%", color: "text-navy-200" },
              { label: "Break-even", value: ticked ? "~23 payments" : "~24 payments", color: "text-navy-300" },
              { label: "Missed Payments", value: "0", color: "text-profit" },
              { label: "Days Active", value: "156", color: "text-navy-200" },
            ].map((m, i) => (
              <FadeIn key={i} show={active} delay={2000 + i * 200}>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-navy-500">{m.label}</span>
                  <span className={`font-semibold transition-all duration-700 ${m.color}`}>{m.value}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </SlideIn>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 6: PAYMENT DISTRIBUTION — Flow split animation
// ================================================================
export function ScenePayment({ active }: { active: boolean }) {
  const [posted, setPosted] = useState(false);
  const [split, setSplit] = useState(false);
  useEffect(() => {
    if (!active) { setPosted(false); setSplit(false); return; }
    const t1 = setTimeout(() => setSplit(true), 1800);
    const t2 = setTimeout(() => setPosted(true), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Payment Processing</p>
        <h2 className="text-2xl font-bold text-white mb-6">Pro-Rata Distribution Engine</h2>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-6 relative">
        {/* Flow dot animation between cards */}
        {split && (
          <>
            <style>{`
              @keyframes flow-split {
                0% { left: 42%; top: 40%; opacity: 0; transform: scale(1.5); }
                20% { opacity: 1; left: 50%; }
                50% { left: 58%; top: 40%; transform: scale(1); }
                75% { opacity: 0.8; }
                100% { left: 62%; top: 35%; opacity: 0; }
              }
              @keyframes flow-split2 {
                0% { left: 42%; top: 40%; opacity: 0; transform: scale(1.5); }
                20% { opacity: 1; left: 50%; }
                50% { left: 58%; top: 40%; transform: scale(1); }
                75% { opacity: 0.8; }
                100% { left: 62%; top: 50%; opacity: 0; }
              }
            `}</style>
            <div className="absolute w-2 h-2 rounded-full bg-emerald-400 opacity-0 pointer-events-none hidden sm:block" style={{ boxShadow: "0 0 8px rgba(52,211,153,0.8)", animation: "flow-split 1.8s 0s ease-in-out infinite" }} />
            <div className="absolute w-2 h-2 rounded-full bg-emerald-400 opacity-0 pointer-events-none hidden sm:block" style={{ boxShadow: "0 0 8px rgba(52,211,153,0.8)", animation: "flow-split2 1.8s 0.3s ease-in-out infinite" }} />
          </>
        )}

        <SlideIn show={active} delay={300}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-5">
            <p className="text-sm font-semibold text-navy-300 mb-4">Payment Received</p>
            <div className="rounded-lg bg-navy-800/70 px-4 py-6 text-center mb-4">
              <p className="text-3xl font-bold text-profit">
                +$<CountUp end={375} show={active} delay={600} />.00
              </p>
              <p className="text-xs text-navy-500 mt-1">Daily ACH — Metro Quick Mart</p>
            </div>
            <FadeIn show={active} delay={1500}>
              <div className="flex items-center gap-2 rounded-lg bg-profit/10 border border-profit/20 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-profit" />
                <span className="text-sm text-profit font-medium">Distributed to 2 investors</span>
              </div>
            </FadeIn>
          </div>
        </SlideIn>

        <SlideIn show={active} delay={600}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-5">
            <p className="text-sm font-semibold text-navy-300 mb-4">Distribution Breakdown</p>
            {[
              { name: "Michael Torres", pct: 60, amount: 225, principal: 225, profit: 0 },
              { name: "Jessica Park", pct: 40, amount: 150, principal: 150, profit: 0 },
            ].map((inv, i) => (
              <FadeIn key={i} show={active} delay={1200 + i * 400}>
                <div className="py-3 border-b border-navy-800/50 last:border-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium">{inv.name}</span>
                    <span className="text-profit font-bold">+${inv.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-navy-500">
                    <span>{inv.pct}% share</span>
                    <span>Principal: ${inv.principal.toFixed(2)}</span>
                    <span>Profit: ${inv.profit.toFixed(2)}</span>
                  </div>
                </div>
              </FadeIn>
            ))}

            <FadeIn show={active} delay={2200}>
              <div className="mt-3 pt-3 border-t border-navy-700/50">
                <p className="text-xs uppercase tracking-wider text-navy-500 mb-2">Running Totals</p>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-navy-400">Total Collected</span>
                  <span className={`font-bold tabular-nums transition-all duration-700 ${posted ? "text-profit" : "text-navy-200"}`}>
                    {posted ? "$42,000.00" : "$41,625.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-navy-400">Remaining</span>
                  <span className="font-bold tabular-nums text-navy-200 transition-all duration-700">
                    {posted ? "$25,500.00" : "$25,875.00"}
                  </span>
                </div>
                <div className="mt-2 relative">
                  <ProgressFill value={posted ? 62 : 61} delay={2400} color="bg-navy-400" show={active} className="h-1.5" />
                  <p className="text-[10px] text-navy-600 text-right mt-0.5">{posted ? "62.2%" : "61.7%"} collected</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </SlideIn>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 7: PORTFOLIO — Ring chart + ROI glow
// ================================================================
function AnimatedRing({ value, active, delay = 0 }: { value: number; active: boolean; delay?: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!active) { setDrawn(false); return; }
    const t = setTimeout(() => setDrawn(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(51,65,85,0.3)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={drawn ? offset : circumference}
          style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(96,165,250)" />
            <stop offset="100%" stopColor="rgb(52,211,153)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-white tabular-nums">{drawn ? value : 0}%</p>
        <p className="text-[9px] text-navy-500 uppercase">Recovery</p>
      </div>
    </div>
  );
}

export function ScenePortfolio({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Investor Portfolio</p>
        <h2 className="text-2xl font-bold text-white mb-6">Real-Time Investment Tracking</h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Invested", value: 87500, prefix: "$" },
          { label: "Total Returned", value: 42300, prefix: "$", color: "text-profit" },
          { label: "Profit Earned", value: 12100, prefix: "$", color: "text-profit" },
          { label: "Available Balance", value: 8400, prefix: "$" },
        ].map((c, i) => (
          <SlideIn key={i} show={active} delay={300 + i * 200}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
              <p className="text-[11px] uppercase text-navy-500 mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color || "text-white"}`}>
                <CountUp end={c.value} prefix={c.prefix} show={active} delay={500 + i * 200} />
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <SlideIn show={active} delay={1200}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4 sm:col-span-1">
            <AnimatedRing value={72} active={active} delay={1500} />
            <FadeIn show={active} delay={2200}>
              <div className="text-center mt-3 rounded-lg bg-profit/10 border border-profit/20 px-3 py-1.5">
                <span className="text-sm font-bold text-profit" style={{ textShadow: "0 0 12px rgba(52,211,153,0.4)" }}>13.8% ROI</span>
              </div>
            </FadeIn>
          </div>
        </SlideIn>

        <SlideIn show={active} delay={1400}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden sm:col-span-2">
            <div className="px-5 py-3 border-b border-navy-700/30">
              <p className="text-xs uppercase tracking-wider text-navy-500">Holdings</p>
            </div>
            {[
              { name: "Metro Quick Mart", status: "Active", invested: "$30,000", profit: "$4,200", recovery: 84 },
              { name: "Sunrise Laundromat", status: "Paid Off", invested: "$12,000", profit: "$4,200", recovery: 100 },
              { name: "Bella's Italian Kitchen", status: "Open", invested: "$15,000", profit: "$0", recovery: 0 },
            ].map((h, i) => (
              <FadeIn key={i} show={active} delay={1800 + i * 300}>
                <div className="flex items-center gap-4 px-5 py-3 border-b border-navy-800/30 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{h.name}</p>
                    <span className={`text-xs ${h.status === "Paid Off" ? "text-profit" : h.status === "Active" ? "text-navy-300" : "text-navy-500"}`}>{h.status}</span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-white font-medium">{h.invested}</p>
                    <p className={h.profit !== "$0" ? "text-profit text-xs" : "text-navy-600 text-xs"}>+{h.profit}</p>
                  </div>
                  <div className="w-16">
                    <ProgressFill value={h.recovery} delay={2000 + i * 300} color={h.recovery >= 100 ? "bg-profit" : "bg-navy-500"} show={active} className="h-1.5" />
                    <p className="text-[10px] text-navy-500 text-right mt-0.5">{h.recovery}%</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </SlideIn>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 8: PAYOUTS — Status beam
// ================================================================
export function ScenePayouts({ active }: { active: boolean }) {
  const [beamStage, setBeamStage] = useState(0);
  useEffect(() => {
    if (!active) { setBeamStage(0); return; }
    const t1 = setTimeout(() => setBeamStage(1), 2200);
    const t2 = setTimeout(() => setBeamStage(2), 2800);
    const t3 = setTimeout(() => setBeamStage(3), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Payout System</p>
        <h2 className="text-2xl font-bold text-white mb-6">Request, Approve, Disburse</h2>
      </FadeIn>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { step: "1", label: "Request", desc: "Rep submits payout from available balance", icon: Wallet, delay: 400 },
          { step: "2", label: "Approve", desc: "Admin reviews and approves the request", icon: CheckCircle2, delay: 800 },
          { step: "3", label: "Disburse", desc: "Funds sent to linked bank via ACH", icon: ArrowUpRight, delay: 1200 },
        ].map((s, i) => (
          <SlideIn key={s.step} show={active} delay={s.delay}>
            <div className={`rounded-xl bg-navy-900/80 border p-5 text-center transition-all duration-500 ${beamStage > i ? "border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.08)]" : "border-navy-700/50"}`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-3 transition-all duration-500 ${beamStage > i ? "bg-emerald-500/15" : "bg-navy-800"}`}>
                <s.icon className={`h-5 w-5 transition-colors duration-500 ${beamStage > i ? "text-emerald-400" : "text-navy-300"}`} />
              </div>
              <p className="text-sm font-bold text-white mb-1">Step {s.step}: {s.label}</p>
              <p className="text-xs text-navy-500">{s.desc}</p>
            </div>
          </SlideIn>
        ))}
      </div>

      <SlideIn show={active} delay={1600}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-5">
          <p className="text-xs uppercase text-navy-500 mb-4">Payout Flow</p>
          <div className="flex items-center justify-between relative">
            {/* Connector lines */}
            <div className="absolute left-[15%] right-[15%] top-1/2 h-px bg-navy-700 -translate-y-1/2" />
            {/* Animated beam */}
            <div
              className="absolute left-[15%] top-1/2 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-400/0 -translate-y-1/2 transition-all duration-700 ease-out"
              style={{ width: beamStage >= 3 ? "70%" : beamStage >= 2 ? "35%" : "0%", opacity: beamStage >= 1 ? 1 : 0 }}
            />
            {beamStage >= 1 && (
              <div className="absolute h-2 w-2 rounded-full bg-emerald-400 -translate-y-1/2 pointer-events-none"
                style={{
                  top: "50%",
                  boxShadow: "0 0 8px rgba(52,211,153,0.8)",
                  left: beamStage >= 3 ? "85%" : beamStage >= 2 ? "50%" : "15%",
                  transition: "left 0.6s ease-out",
                }}
              />
            )}
            {["Pending", "Approved", "Completed"].map((status, i) => (
              <FadeIn key={status} show={active} delay={2000 + i * 400}>
                <div className="flex flex-col items-center relative z-10">
                  <div className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-500 ${
                    beamStage > i
                      ? "bg-profit/15 text-profit"
                      : beamStage === i
                        ? "bg-amber-500/15 text-amber-400"
                        : i === 0
                          ? "bg-amber-500/15 text-amber-400"
                          : i === 1
                            ? "bg-navy-700 text-navy-200"
                            : "bg-navy-700 text-navy-200"
                  }`}>
                    {status}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn show={active} delay={3600}>
            <div className="mt-5 text-center">
              <p className="text-2xl font-bold text-profit" style={{ textShadow: beamStage >= 3 ? "0 0 20px rgba(52,211,153,0.3)" : "none", transition: "text-shadow 0.5s" }}>$5,000.00</p>
              <p className="text-xs text-navy-500 mt-1">Deposited to Chase ****4521</p>
            </div>
          </FadeIn>
        </div>
      </SlideIn>
    </div>
  );
}

// ================================================================
// SCENE 9: SECURITY — Terminal typing audit log
// ================================================================
export function SceneSecurity({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase tracking-widest text-navy-400">Security & Controls</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-6">Enterprise-Grade Protection</h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: ShieldCheck, label: "Two-Factor Auth", desc: "TOTP + recovery codes" },
          { icon: KeyRound, label: "Encrypted Data", desc: "AES-256-GCM at rest" },
          { icon: FileText, label: "Audit Trail", desc: "Every action logged" },
          { icon: Users, label: "Role-Based Access", desc: "5 permission levels" },
        ].map((f, i) => (
          <SlideIn key={i} show={active} delay={300 + i * 200}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4 text-center">
              <f.icon className="h-6 w-6 text-navy-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">{f.label}</p>
              <p className="text-[11px] text-navy-500 mt-0.5">{f.desc}</p>
            </div>
          </SlideIn>
        ))}
      </div>

      <SlideIn show={active} delay={1200}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-700/30 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-navy-500">Audit Log</p>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-amber-500/60" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
            </div>
          </div>
          <div className="font-mono text-xs px-5 py-3 space-y-1">
            {[
              { text: "[14:22:48] PAYMENT_POSTED    Sarah Chen        Metro Quick Mart — $375.00", delay: 1500 },
              { text: "[13:15:02] DEAL_PUBLISHED    James Morrison    Summit Auto Repair — $75,000", delay: 2200 },
              { text: "[10:42:17] PAYOUT_APPROVED   James Morrison    Michael Torres — $5,000", delay: 2900 },
              { text: "[09:11:33] MFA_ENABLED       Jessica Park      Two-factor authentication", delay: 3600 },
            ].map((log, i) => (
              <div key={i} className="text-navy-400">
                <TypeWriter text={log.text} active={active} delay={log.delay} className="whitespace-pre" />
              </div>
            ))}
          </div>
        </div>
      </SlideIn>
    </div>
  );
}

// ================================================================
// SCENE 10: CLOSING — Constellation callback
// ================================================================
export function SceneClosing({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 relative overflow-hidden">
      {/* Background pulse rings — callback to hero */}
      {active && (
        <style>{`
          @keyframes closing-pulse {
            0% { transform: scale(1); opacity: 0.08; }
            100% { transform: scale(4); opacity: 0; }
          }
        `}</style>
      )}
      {active && [0, 1, 2].map((i) => (
        <div key={i} className="absolute w-24 h-24 rounded-full border border-navy-500/20 pointer-events-none" style={{ left: "50%", top: "38%", transform: "translate(-50%, -50%)", animation: `closing-pulse 4s ${i * 1.3}s ease-out infinite` }} />
      ))}

      <FadeIn show={active} delay={200}>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 mb-8 mx-auto shadow-2xl shadow-navy-500/20 border border-navy-400/20">
          <CircleDollarSign className="h-9 w-9 text-white" />
        </div>
      </FadeIn>
      <FadeIn show={active} delay={800}>
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2">Capital Marketplace</h2>
      </FadeIn>
      <FadeIn show={active} delay={1100}>
        <div className="h-px w-24 bg-navy-600 mx-auto my-4" />
      </FadeIn>
      <FadeIn show={active} delay={1300}>
        <p className="text-lg text-navy-300 mb-8 max-w-lg">A private syndication platform that transforms deal flow into structured investment opportunities.</p>
      </FadeIn>
      <FadeIn show={active} delay={1700}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { value: "9", label: "Deal Statuses" },
            { value: "5", label: "User Roles" },
            { value: "Pro-Rata", label: "Distribution" },
            { value: "Plaid", label: "Bank Integration" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-navy-900/60 border border-navy-700/40 px-4 py-3">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-navy-500">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>
      <FadeIn show={active} delay={2200}>
        <p className="text-xl font-semibold text-white mb-2">Let&apos;s launch your marketplace.</p>
        <p className="text-sm text-navy-500">Ready for deployment — reach out to schedule onboarding.</p>
      </FadeIn>
    </div>
  );
}
