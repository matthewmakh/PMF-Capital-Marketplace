"use client";

import { useDemo } from "./use-demo";
import {
  SceneHero, SceneAdminDashboard, SceneEmailIngestion, SceneDealMarketplace,
  SceneDealDetail, ScenePayment, ScenePortfolio,
  ScenePayouts, SceneSecurity, SceneClosing,
} from "./scenes";
import { Play, Pause, ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

const SCENES = [
  { component: SceneHero, label: "Intro", caption: "" },
  { component: SceneAdminDashboard, label: "Dashboard", caption: "Admins get a real-time command center — capital deployed, deal pipeline, and actionable alerts at a glance." },
  { component: SceneEmailIngestion, label: "Deal Intake", caption: "Deals arrive via email, get automatically parsed, and appear on the dashboard for admin review — no manual data entry." },
  { component: SceneDealMarketplace, label: "Marketplace", caption: "Open deals are listed with live syndication progress. Reps browse, evaluate, and invest in seconds." },
  { component: SceneDealDetail, label: "Deal Detail", caption: "Every deal shows real-time metrics — collection rate, break-even countdown, and full investor breakdown." },
  { component: ScenePayment, label: "Payments", caption: "Merchant payments are distributed pro-rata instantly. Principal recovers first, then profit flows to investors." },
  { component: ScenePortfolio, label: "Portfolio", caption: "Every investor sees their portfolio in real time — returns, break-even status, and available balance for payout." },
  { component: ScenePayouts, label: "Payouts", caption: "Reps request payouts from earned returns. Admins approve. Funds are disbursed to linked bank accounts via ACH." },
  { component: SceneSecurity, label: "Security", caption: "Enterprise-grade security — two-factor auth, full audit trail, role-based access, and AES-256 encrypted data." },
  { component: SceneClosing, label: "Summary", caption: "" },
];

export default function DemoPage() {
  const { scene, playing, sceneProgress, goTo, next, prev, togglePlay } = useDemo(SCENES.length);
  const caption = SCENES[scene].caption;

  return (
    <div className="relative h-screen flex flex-col">
      {/* Top-right demo switcher */}
      <Link
        href="/demo/underwriting"
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-navy-700/60 bg-navy-900/70 px-3 py-1.5 text-xs font-medium text-navy-300 hover:border-navy-500 hover:text-white transition-colors backdrop-blur-sm"
      >
        <ArrowLeftRight className="h-3 w-3" />
        Underwriting Demo
      </Link>

      {/* Scene content */}
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: caption ? 140 : 80 }}>
        {SCENES.map(({ component: Scene }, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${i === scene ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            style={{ bottom: caption ? 140 : 80 }}
          >
            <div className="h-full overflow-y-auto">
              <Scene active={i === scene} />
            </div>
          </div>
        ))}
      </div>

      {/* Caption bar */}
      {caption && (
        <div className="fixed left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-sm border-t border-navy-800/50 px-6 py-3" style={{ bottom: 56 }}>
          <p className="text-sm text-navy-200 text-center max-w-2xl mx-auto leading-relaxed">
            {caption}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur-sm border-t border-navy-800/50">
        <div className="h-0.5 bg-navy-800">
          <div className="h-full bg-navy-400 transition-all duration-100" style={{ width: `${((scene + sceneProgress) / (SCENES.length - 1)) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={prev} disabled={scene === 0} className="rounded-full p-1.5 text-navy-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={togglePlay} className="rounded-full p-1.5 text-navy-400 hover:text-white transition-colors">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
            <button onClick={next} disabled={scene === SCENES.length - 1} className="rounded-full p-1.5 text-navy-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
            <span className="text-xs text-navy-500 ml-2 hidden sm:block">{SCENES[scene].label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {SCENES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === scene ? "h-2 w-6 bg-navy-300" : i < scene ? "h-2 w-2 bg-navy-500" : "h-2 w-2 bg-navy-700"}`} />
            ))}
          </div>
          <span className="text-xs text-navy-600 tabular-nums">{scene + 1} / {SCENES.length}</span>
        </div>
      </div>
    </div>
  );
}
