export async function isInternetReachable(timeoutMs = 3500): Promise<boolean> {
  // For web builds, avoid cross-origin checks (CORS can block them).
  // Use a same-origin lightweight request instead.
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (typeof window === 'undefined') return true;

    // `/api/db.json` exists in this app and is same-origin in dev + Vercel.
    const res = await fetch('/api/db.json', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

