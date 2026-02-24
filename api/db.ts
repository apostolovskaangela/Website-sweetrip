const KV_KEY = 'sweetrip:db:v1';

function isValidDatabaseShape(value: any) {
  return (
    value &&
    Array.isArray(value.users) &&
    Array.isArray(value.vehicles) &&
    Array.isArray(value.trips) &&
    // optional in seed; we normalize to []
    (value.trip_stops == null || Array.isArray(value.trip_stops)) &&
    // optional in seed; we normalize to []
    (value.roles == null || Array.isArray(value.roles))
  );
}

function normalizeDb(value: any) {
  const v = value && typeof value === 'object' ? value : {};
  return {
    users: Array.isArray(v.users) ? v.users : [],
    vehicles: Array.isArray(v.vehicles) ? v.vehicles : [],
    trips: Array.isArray(v.trips) ? v.trips : [],
    trip_stops: Array.isArray(v.trip_stops) ? v.trip_stops : [],
    roles: Array.isArray(v.roles) ? v.roles : [],
  };
}

function getOrigin(req: any) {
  const proto = (req?.headers?.['x-forwarded-proto'] ?? 'https') as string;
  const host = (req?.headers?.host ?? '').toString();
  return host ? `${proto}://${host}` : '';
}

async function getKvClient(): Promise<null | { get: (k: string) => Promise<any>; set: (k: string, v: any) => Promise<any> }> {
  // Lazy import so a bad KV config doesn't crash the function at import time.
  try {
    const mod: any = await import('@vercel/kv');
    return mod?.kv ?? null;
  } catch {
    return null;
  }
}

async function readSeedDb(req: any) {
  // On Vercel, serverless functions do not reliably have access to `/public` on disk.
  // Fetch the public seed via HTTP instead.
  const origin = getOrigin(req);
  const candidates = origin
    ? [`${origin}/api/db.json`, `${origin}/app/api/db.json`]
    : ['/api/db.json', '/app/api/db.json'];

  let data: any = null;
  let lastStatus: number | null = null;
  for (const url of candidates) {
    const res = await fetch(url, { cache: 'no-store' });
    lastStatus = res.status;
    if (!res.ok) continue;
    data = await res.json();
    break;
  }

  if (!data) {
    throw new Error(`Failed to load seed db.json: ${lastStatus ?? 'unknown'}`);
  }
  if (!isValidDatabaseShape(data)) {
    throw new Error('Seed db.json has invalid shape');
  }
  return normalizeDb(data);
}

async function getOrSeedDb(req: any) {
  const kv = await getKvClient();
  if (!kv) {
    // KV unavailable → fall back to seed (read-only/shared DB disabled)
    return readSeedDb(req);
  }

  const existing = await kv.get(KV_KEY);
  if (existing && isValidDatabaseShape(existing)) return normalizeDb(existing);
  const seed = await readSeedDb(req);
  await kv.set(KV_KEY, seed);
  return seed;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'HEAD') {
      // Used by connectivity checks; keep it lightweight.
      await getOrSeedDb(req);
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).end();
      return;
    }

    if (req.method === 'GET') {
      const db = await getOrSeedDb(req);
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(db);
      return;
    }

    if (req.method === 'PUT') {
      const kv = await getKvClient();
      if (!kv) {
        res.status(503).json({
          error:
            'Shared database is not available (KV/Redis not configured). Add the Redis/KV integration in Vercel and redeploy.',
        });
        return;
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const db = body?.db ?? body;
      if (!isValidDatabaseShape(db)) {
        res.status(400).json({ error: 'Invalid database payload' });
        return;
      }
      await kv.set(KV_KEY, normalizeDb(db));
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'POST') {
      const kv = await getKvClient();
      if (!kv) {
        res.status(503).json({
          error:
            'Shared database is not available (KV/Redis not configured). Add the Redis/KV integration in Vercel and redeploy.',
        });
        return;
      }
      // reset
      const seed = await readSeedDb(req);
      await kv.set(KV_KEY, seed);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    const msg = e?.message ?? 'Server error';
    // If KV isn't configured, give a clearer hint.
    if (typeof msg === 'string' && (msg.includes('KV_') || msg.toLowerCase().includes('vercel kv') || msg.toLowerCase().includes('upstash'))) {
      res.status(500).json({
        error:
          'Shared database is not configured. Add a Redis/KV integration in Vercel and ensure KV_REST_API_URL and KV_REST_API_TOKEN are set.',
      });
      return;
    }
    res.status(500).json({ error: msg });
  }
}

