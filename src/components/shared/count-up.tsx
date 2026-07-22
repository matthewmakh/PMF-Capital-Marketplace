"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  /** "currency" formats with formatCurrency; otherwise a locale-grouped number. */
  format?: "currency" | "number";
  duration?: number;
  delay?: number;
  /** Toggle the animation on/off; resets to 0 when false (used by the demo). */
  show?: boolean;
  /** Animate only on the first mount, then snap to later `end` values (KPI tiles). */
  once?: boolean;
  className?: string;
}

export function CountUp({
  end,
  prefix = "",
  suffix = "",
  format,
  duration = 2000,
  delay = 0,
  show = true,
  once = false,
  className,
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!show) {
      setValue(0);
      return;
    }

    // First-mount-only tiles: once animated, jump straight to any new value
    // (e.g. after router.refresh()) rather than replaying.
    if (once && started.current) {
      setValue(end);
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      started.current = true;
      setValue(end);
      return;
    }

    started.current = true;
    const startTime = Date.now() + delay;
    const animate = () => {
      const now = Date.now();
      if (now < startTime) {
        raf.current = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      // Keep the final frame exact so cents aren't lost to rounding.
      setValue(progress >= 1 ? end : Math.round(end * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [end, duration, delay, show, once]);

  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : end >= 1000
        ? `${prefix}${value.toLocaleString()}${suffix}`
        : `${prefix}${value}${suffix}`;

  return <span className={cn("tabular-nums", className)}>{formatted}</span>;
}
