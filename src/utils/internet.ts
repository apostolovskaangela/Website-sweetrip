export async function isInternetReachable(timeoutMs = 3500): Promise<boolean> {
  // React Native supports AbortController in modern runtimes (Expo SDK 50+).
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // A small endpoint that returns HTTP 204 when reachable.
    const res = await fetch("https://clients3.google.com/generate_204", {
      method: "GET",
      signal: controller.signal,
      // prevent caching if any platform caches this request
      headers: { "Cache-Control": "no-cache" },
    });
    return res.status === 204 || res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

