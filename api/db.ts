const KV_KEY = 'sweetrip:db:v1';

let kvClient: any | null = null;
async function getKv() {
  if (kvClient) return kvClient;
  // Vercel's plain serverless functions are often executed as CommonJS.
  // Using dynamic import keeps this file compatible without requiring "type":"module".
  const mod: any = await import('@vercel/kv');
  kvClient = mod?.kv;
  if (!kvClient) {
    throw new Error('Failed to initialize Vercel KV client');
  }
  return kvClient;
}

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

function getHeader(req: any, name: string): string | null {
  const headers = req?.headers;
  if (!headers) return null;

  // Edge-like: Headers instance
  if (typeof headers.get === 'function') {
    return headers.get(name);
  }

  // Node-like: plain object
  const key = name.toLowerCase();
  const value = (headers as any)[name] ?? (headers as any)[key];
  return value != null ? String(value) : null;
}

function getOrigin(req: any) {
  const proto = getHeader(req, 'x-forwarded-proto') ?? 'https';
  const host =
    getHeader(req, 'x-forwarded-host') ??
    getHeader(req, 'host') ??
    // Vercel provides this automatically (no protocol)
    ((globalThis as any)?.process?.env?.VERCEL_URL ? String((globalThis as any).process.env.VERCEL_URL) : null) ??
    getHeader(req, 'x-vercel-deployment-url') ??
    '';

  if (!host) return '';
  const normalizedHost = host.startsWith('http://') || host.startsWith('https://') ? host : `${proto}://${host}`;
  try {
    return new URL(normalizedHost).origin;
  } catch {
    return '';
  }
}

async function kvGetDb(): Promise<any | null> {
  const kv = await getKv();
  return kv.get(KV_KEY);
}

async function kvSetDb(db: any): Promise<void> {
  const kv = await getKv();
  await kv.set(KV_KEY, db);
}

async function readSeedDb(req: any) {
  // On Vercel, serverless functions do not reliably have access to `/public` on disk.
  // Fetch the public seed via HTTP instead.
  const origin = getOrigin(req);
  if (!origin) {
    throw new Error(
      'Failed to determine request origin to load seed db.json. (Missing Host/Forwarded headers and VERCEL_URL.)'
    );
  }

  const candidates = [`${origin}/api/db.json`, `${origin}/app/api/db.json`];

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
  const existing = await kvGetDb();
  if (existing) {
    // Support both JSON-string values (older versions) and structured JSON values.
    if (typeof existing === 'string') {
      try {
        const parsed = JSON.parse(existing);
        if (isValidDatabaseShape(parsed)) return normalizeDb(parsed);
      } catch {
        // fall through to reseed
      }
    } else if (isValidDatabaseShape(existing)) {
      return normalizeDb(existing);
    }
  }
  const seed = await readSeedDb(req);
  await kvSetDb(seed);
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
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const db = body?.db ?? body;
      if (!isValidDatabaseShape(db)) {
        res.status(400).json({ error: 'Invalid database payload' });
        return;
      }
      await kvSetDb(normalizeDb(db));
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'POST') {
      // reset
      const seed = await readSeedDb(req);
      await kvSetDb(seed);
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

