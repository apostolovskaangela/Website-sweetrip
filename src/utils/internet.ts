export async function isInternetReachable(timeoutMs = 3500): Promise<boolean> {
  // For web builds, avoid cross-origin checks (CORS can block them).
  // Use a same-origin lightweight request instead.
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (typeof window === 'undefined') return true;

    const isProd = typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD;
    // Prefer the shared DB endpoint when available.
    const urls = isProd ? ['/api/db'] : ['/api/db', '/api/db.json'];

    for (const url of urls) {
      // same-origin lightweight request
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      if (res.ok) return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

