import { kv } from '@vercel/kv';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const KV_KEY = 'sweetrip:db:v1';

function isValidDatabaseShape(value: any) {
  return (
    value &&
    Array.isArray(value.users) &&
    Array.isArray(value.vehicles) &&
    Array.isArray(value.trips) &&
    Array.isArray(value.trip_stops) &&
    Array.isArray(value.roles)
  );
}

async function readSeedDb() {
  const seedPath = path.join(process.cwd(), 'public', 'api', 'db.json');
  const raw = await readFile(seedPath, 'utf8');
  const data = JSON.parse(raw);
  if (!isValidDatabaseShape(data)) {
    throw new Error('Seed db.json has invalid shape');
  }
  return data;
}

async function getOrSeedDb() {
  const existing = await kv.get(KV_KEY);
  if (existing && isValidDatabaseShape(existing)) return existing;
  const seed = await readSeedDb();
  await kv.set(KV_KEY, seed);
  return seed;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const db = await getOrSeedDb();
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
      await kv.set(KV_KEY, db);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'POST') {
      // reset
      const seed = await readSeedDb();
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

