import { isInternetReachable } from "@/src/utils/internet";

type Listener = (isOffline: boolean) => void;

let isOffline = false;
let lastCheckedAt = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<Listener>();

function notify(next: boolean) {
  for (const l of listeners) l(next);
}

async function checkAndUpdate() {
  const reachable = await isInternetReachable();
  const nextOffline = !reachable;
  lastCheckedAt = Date.now();
  if (nextOffline !== isOffline) {
    isOffline = nextOffline;
    notify(isOffline);
  }
}

export function startInternetStatusMonitor(pollMs = 5000) {
  if (intervalId) return;
  // kick off immediately
  checkAndUpdate().catch(() => {});
  intervalId = setInterval(() => {
    checkAndUpdate().catch(() => {});
  }, pollMs);
}

export function stopInternetStatusMonitor() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}

export function subscribeInternetStatus(listener: Listener) {
  listeners.add(listener);
  // Ensure the monitor is running for subscribers
  startInternetStatusMonitor();
  // Emit current state immediately
  listener(isOffline);
  return () => listeners.delete(listener);
}

export function getInternetStatus() {
  return { isOffline, lastCheckedAt };
}

export async function checkInternetNow() {
  await checkAndUpdate();
  return isOffline;
}

