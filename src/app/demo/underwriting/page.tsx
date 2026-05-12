"use client";

import { useDemo } from "../use-demo";
import {
  SceneHero,
  SceneProblem,
  ScenePortalUpload,
  SceneTamperDetection,
  SceneStatementAnalytics,
  SceneVendorPulls,
  SceneUnderwritingSummary,
  SceneDecision,
  SceneClosing,
} from "./scenes";
import { Play, Pause, ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

const SCENES = [
  { component: SceneHero, label: "Intro", caption: "" },
  {
    component: SceneProblem,
    label: "The Problem",
    caption:
      "MCA underwriting normally takes 2–6 hours per file across spreadsheets, bureaus, and bank statements. We do it in 90 seconds.",
  },
  {
    component: ScenePortalUpload,
    label: "Merchant Portal",
    caption:
      "Brokers send a single link. Merchants drag-drop documents or connect their bank via Plaid — no login, no friction.",
  },
  {
    component: SceneTamperDetection,
    label: "Tamper Detection",
    caption:
      "Every PDF is scanned the instant it lands. A built-in inspector + Inscribe catch Word/Photoshop producers, modification drift, and splicing.",
  },
  {
    component: SceneStatementAnalytics,
    label: "Statement Analytics",
    caption:
      "Plaid + Azure Document Intelligence transactionize the statements. The metrics engine computes true revenue, negative days, NSFs, and detects every open MCA position.",
  },
  {
    component: SceneVendorPulls,
    label: "Third-Party Pulls",
    caption:
      "Microbilt, DataMerch, Wolters Kluwer iLien, and KYB fire in parallel — credit, OFAC, MCA blacklist, UCC liens, business legitimacy — all under 8 seconds.",
  },
  {
    component: SceneUnderwritingSummary,
    label: "Underwriting Summary",
    caption:
      "Everything composites into one screen. Paper grade computes live from FICO + time-in-business + bank metrics + positions. Risk flags surfaced automatically.",
  },
  {
    component: SceneDecision,
    label: "Decision & Audit",
    caption:
      "Underwriter approves, declines, or requests stips. Every action is audit-logged with actor, IP, timestamp, and decision rationale.",
  },
  { component: SceneClosing, label: "Summary", caption: "" },
];

export default function UnderwritingDemoPage() {
  const { scene, playing, sceneProgress, goTo, next, prev, togglePlay } =
    useDemo(SCENES.length);
  const caption = SCENES[scene].caption;

  return (
    <div className="relative h-screen flex flex-col">
      {/* Top-right demo switcher */}
      <Link
        href="/demo"
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-navy-700/60 bg-navy-900/70 px-3 py-1.5 text-xs font-medium text-navy-300 hover:border-navy-500 hover:text-white transition-colors backdrop-blur-sm"
      >
        <ArrowLeftRight className="h-3 w-3" />
        Marketplace Demo
      </Link>

      <div
        className="flex-1 overflow-hidden"
        style={{ paddingBottom: caption ? 140 : 80 }}
      >
        {SCENES.map(({ component: Scene }, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === scene
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
            style={{ bottom: caption ? 140 : 80 }}
          >
            <div className="h-full overflow-y-auto">
              <Scene active={i === scene} />
            </div>
          </div>
        ))}
      </div>

      {caption && (
        <div
          className="fixed left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-sm border-t border-navy-800/50 px-6 py-3"
          style={{ bottom: 56 }}
        >
          <p className="text-sm text-navy-200 text-center max-w-3xl mx-auto leading-relaxed">
            {caption}
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur-sm border-t border-navy-800/50">
        <div className="h-0.5 bg-navy-800">
          <div
            className="h-full bg-navy-400 transition-all duration-100"
            style={{
              width: `${((scene + sceneProgress) / (SCENES.length - 1)) * 100}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={prev}
              disabled={scene === 0}
              className="rounded-full p-1.5 text-navy-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="rounded-full p-1.5 text-navy-400 hover:text-white transition-colors"
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={next}
              disabled={scene === SCENES.length - 1}
              className="rounded-full p-1.5 text-navy-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-navy-500 ml-2 hidden sm:block">
              {SCENES[scene].label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === scene
                    ? "h-2 w-6 bg-navy-300"
                    : i < scene
                      ? "h-2 w-2 bg-navy-500"
                      : "h-2 w-2 bg-navy-700"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-navy-600 tabular-nums">
            {scene + 1} / {SCENES.length}
          </span>
        </div>
      </div>
    </div>
  );
}
