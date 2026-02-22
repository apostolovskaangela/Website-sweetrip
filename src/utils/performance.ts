/**
 * Lightweight performance monitoring for development.
 * Use in __DEV__ to log slow renders or track metrics.
 */
import { useRef } from "react";

const ENABLED = typeof __DEV__ !== "undefined" && __DEV__;

export interface PerfMark {
  name: string;
  start: number;
}

/** Start a timing mark */
export function mark(name: string): PerfMark {
  const start = ENABLED ? performance.now() : 0;
  return { name, start };
}

/** End a timing mark and log if over threshold (ms) */
export function measure(m: PerfMark, thresholdMs = 16): number {
  if (!ENABLED) return 0;
  const duration = performance.now() - m.start;
  if (duration >= thresholdMs) {
    console.warn(`[Perf] ${m.name} took ${duration.toFixed(1)}ms`);
  }
  return duration;
}

/** Wrap an async function and log its duration */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  thresholdMs = 100
): Promise<T> {
  const m = mark(name);
  try {
    return await fn();
  } finally {
    measure(m, thresholdMs);
  }
}

/** Simple render counter for debugging re-renders (use in __DEV__ only) */
export function useRenderCount(componentName: string): void {
  const countRef = useRef(0);
  countRef.current += 1;
  if (ENABLED && countRef.current <= 5) {
    console.log(`[Perf] ${componentName} render #${countRef.current}`);
  }
}

// Track slow renders → useRenderCount, mark + measure.

// Track slow async tasks → measureAsync.

// Warn when operations exceed thresholds → helps keep UI snappy