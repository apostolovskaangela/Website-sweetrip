const KV_KEY = 'sweetrip:db:v1';

let kvClient = null;
async function getKv() {
  if (kvClient) return kvClient;
  // Works in CommonJS and with ESM-only dependencies.
  const mod = await import('@vercel/kv');
  kvClient = mod && mod.kv;
  if (!kvClient) throw new Error('Failed to initialize Vercel KV client');
  return kvClient;
}

function isValidDatabaseShape(value) {
  return (
    value &&
    Array.isArray(value.users) &&
    Array.isArray(value.vehicles) &&
    Array.isArray(value.trips) &&
    (value.trip_stops == null || Array.isArray(value.trip_stops)) &&
    (value.roles == null || Array.isArray(value.roles))
  );
}

function normalizeDb(value) {
  const v = value && typeof value === 'object' ? value : {};
  return {
    users: Array.isArray(v.users) ? v.users : [],
    vehicles: Array.isArray(v.vehicles) ? v.vehicles : [],
    trips: Array.isArray(v.trips) ? v.trips : [],
    trip_stops: Array.isArray(v.trip_stops) ? v.trip_stops : [],
    roles: Array.isArray(v.roles) ? v.roles : [],
  };
}

function getHeader(req, name) {
  const headers = req && req.headers;
  if (!headers) return null;
  if (typeof headers.get === 'function') return headers.get(name);
  const key = String(name).toLowerCase();
  const value = headers[name] ?? headers[key];
  return value != null ? String(value) : null;
}

function getOrigin(req) {
  const proto = getHeader(req, 'x-forwarded-proto') ?? 'https';
  const env = (globalThis && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
  const host =
    getHeader(req, 'x-forwarded-host') ??
    getHeader(req, 'host') ??
    (env.VERCEL_URL ? String(env.VERCEL_URL) : null) ??
    getHeader(req, 'x-vercel-deployment-url') ??
    '';

  if (!host) return '';
  const normalized = host.startsWith('http://') || host.startsWith('https://') ? host : `${proto}://${host}`;
  try {
    return new URL(normalized).origin;
  } catch {
    return '';
  }
}

async function kvGetDb() {
  const kv = await getKv();
  return kv.get(KV_KEY);
}

async function kvSetDb(db) {
  const kv = await getKv();
  await kv.set(KV_KEY, db);
}

async function readSeedDb(req) {
  const origin = getOrigin(req);
  if (!origin) {
    throw new Error(
      'Failed to determine request origin to load seed db.json. (Missing Host/Forwarded headers and VERCEL_URL.)'
    );
  }

  const candidates = [`${origin}/api/db.json`, `${origin}/app/api/db.json`];

  let data = null;
  let lastStatus = null;
  for (const url of candidates) {
    const res = await fetch(url, { cache: 'no-store' });
    lastStatus = res.status;
    if (!res.ok) continue;
    data = await res.json();
    break;
  }

  if (!data) throw new Error(`Failed to load seed db.json: ${lastStatus ?? 'unknown'}`);
  if (!isValidDatabaseShape(data)) throw new Error('Seed db.json has invalid shape');
  return normalizeDb(data);
}

async function getOrSeedDb(req) {
  const existing = await kvGetDb();
  if (existing) {
    if (typeof existing === 'string') {
      try {
        const parsed = JSON.parse(existing);
        if (isValidDatabaseShape(parsed)) return normalizeDb(parsed);
      } catch {
        // fall through
      }
    } else if (isValidDatabaseShape(existing)) {
      return normalizeDb(existing);
    }
  }

  const seed = await readSeedDb(req);
  await kvSetDb(seed);
  return seed;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'HEAD') {
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
      const db = (body && body.db) ? body.db : body;
      if (!isValidDatabaseShape(db)) {
        res.status(400).json({ error: 'Invalid database payload' });
        return;
      }
      await kvSetDb(normalizeDb(db));
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'POST') {
      const seed = await readSeedDb(req);
      await kvSetDb(seed);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const msg = e && e.message ? e.message : 'Server error';
    res.status(500).json({ error: msg });
  }
};

