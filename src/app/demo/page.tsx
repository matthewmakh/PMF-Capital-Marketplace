"use client";

import { useDemo } from "./use-demo";
import {
  SceneHero, SceneAdminDashboard, SceneDealMarketplace,
  SceneDealDetail, ScenePayment, ScenePortfolio,
  ScenePayouts, SceneSecurity, SceneClosing,
} from "./scenes";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

const SCENES = [
  { component: SceneHero, label: "Intro" },
  { component: SceneAdminDashboard, label: "Dashboard" },
  { component: SceneDealMarketplace, label: "Marketplace" },
  { component: SceneDealDetail, label: "Deal Detail" },
  { component: ScenePayment, label: "Payments" },
  { component: ScenePortfolio, label: "Portfolio" },
  { component: ScenePayouts, label: "Payouts" },
  { component: SceneSecurity, label: "Security" },
  { component: SceneClosing, label: "Summary" },
];

export default function DemoPage() {
  const { scene, playing, sceneProgress, goTo, next, prev, togglePlay } = useDemo(SCENES.length);

  return (
    <div className="relative h-screen flex flex-col">
      {/* Scene content */}
      <div className="flex-1 overflow-y-auto">
        {SCENES.map(({ component: Scene }, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${i === scene ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            style={{ top: 0, bottom: 80 }}
          >
            <div className="h-full overflow-y-auto">
              <Scene active={i === scene} />
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-sm border-t border-navy-800/50">
        {/* Progress bar */}
        <div className="h-0.5 bg-navy-800">
          <div
            className="h-full bg-navy-400 transition-all duration-100"
            style={{ width: `${((scene + sceneProgress) / (SCENES.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          {/* Scene label */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={prev} disabled={scene === 0} className="rounded-full p-1.5 text-navy-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={togglePlay} className="rounded-full p-1.5 text-navy-400 hover:text-white transition-colors">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button onClick={next} disabled={scene === SCENES.length - 1} className="rounded-full p-1.5 text-navy-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-navy-500 ml-2 hidden sm:block">{SCENES[scene].label}</span>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === scene ? "h-2 w-6 bg-navy-300" : i < scene ? "h-2 w-2 bg-navy-500" : "h-2 w-2 bg-navy-700"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="text-xs text-navy-600 tabular-nums">{scene + 1} / {SCENES.length}</span>
        </div>
      </div>
    </div>
  );
}
