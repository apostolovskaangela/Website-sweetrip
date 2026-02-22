import * as SQLite from 'expo-sqlite';

import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema';
import { nowIso, toSqlBool } from './utils';

// Bump this when you change `api/db.json` seed data (users/credentials/etc).
const SEED_VERSION = 4;

type SeedUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
  manager_id: number | null;
  last_latitude?: number | null;
  last_longitude?: number | null;
  last_location_at?: string | null;
};

type SeedVehicle = {
  id: number;
  registration_number: string | null;
  notes?: string | null;
  is_active: boolean;
  manager_id: number;
};

type SeedTrip = {
  id: number;
  trip_number: string;
  vehicle_id: number;
  driver_id: number;
  a_code?: string | null;
  destination_from: string;
  destination_to: string;
  status: string;
  mileage?: number | null;
  cmr?: string | null;
  driver_description?: string | null;
  admin_description?: string | null;
  trip_date: string; // YYYY-MM-DD
  invoice_number?: string | null;
  amount?: number | null;
  created_by?: number | null;
};

type SeedTripStop = {
  id: number;
  trip_id: number;
  destination: string;
  stop_order: number;
  notes?: string | null;
};

type SeedDbJson = {
  users: SeedUser[];
  vehicles: SeedVehicle[];
  trips: SeedTrip[];
  trip_stops?: SeedTripStop[];
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('sweetrip.db');
  }
  return dbPromise;
}

async function execBatch(db: SQLite.SQLiteDatabase, sql: string) {
  // expo-sqlite supports execAsync for multiple statements.
  // If not available (older environments), fall back to a naive split.
  const anyDb: any = db as any;
  if (typeof anyDb.execAsync === 'function') {
    await anyDb.execAsync(sql);
    return;
  }

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await db.execAsync(`${stmt};`);
  }
}

async function isSeeded(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM users');
  return (row?.cnt ?? 0) > 0;
}

async function getMeta(db: SQLite.SQLiteDatabase, key: string): Promise<string | null> {
  try {
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key]);
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function setMeta(db: SQLite.SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [key, value]);
}

async function writeVersions(db: SQLite.SQLiteDatabase): Promise<void> {
  await setMeta(db, 'schema_version', String(SCHEMA_VERSION));
  await setMeta(db, 'seed_version', String(SEED_VERSION));
}

async function seedFromJson(db: SQLite.SQLiteDatabase) {
  // Required by the professor: `api/db.json` replaces Laravel seeders.
  // We load it from the JS bundle via require (avoid TS resolveJsonModule issues).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seed: SeedDbJson = require('../../../api/db.json');
  const tripStops: SeedTripStop[] = Array.isArray(seed.trip_stops) ? seed.trip_stops : [];

  const ts = nowIso();
  await db.withTransactionAsync(async () => {
    for (const u of seed.users) {
      await db.runAsync(
        `INSERT OR REPLACE INTO users
          (id, name, email, manager_id, role_id, password, last_latitude, last_longitude, last_location_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id,
          u.name,
          u.email,
          u.manager_id,
          u.role_id,
          u.password,
          u.last_latitude ?? null,
          u.last_longitude ?? null,
          u.last_location_at ?? null,
          ts,
          ts,
        ]
      );
    }

    for (const v of seed.vehicles) {
      await db.runAsync(
        `INSERT OR REPLACE INTO vehicles
          (id, registration_number, notes, is_active, manager_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.registration_number, v.notes ?? null, toSqlBool(v.is_active), v.manager_id, ts, ts]
      );
    }

    for (const t of seed.trips) {
      await db.runAsync(
        `INSERT OR REPLACE INTO trips
          (id, trip_number, vehicle_id, driver_id, a_code, destination_from, destination_to, status, mileage, cmr, driver_description, admin_description, trip_date, invoice_number, amount, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.trip_number,
          t.vehicle_id,
          t.driver_id,
          t.a_code ?? null,
          t.destination_from,
          t.destination_to,
          t.status ?? 'not_started',
          t.mileage ?? null,
          t.cmr ?? null,
          t.driver_description ?? null,
          t.admin_description ?? null,
          t.trip_date,
          t.invoice_number ?? null,
          t.amount ?? null,
          t.created_by ?? null,
          ts,
          ts,
        ]
      );
    }

    for (const s of tripStops) {
      await db.runAsync(
        `INSERT OR REPLACE INTO trip_stops
          (id, trip_id, destination, stop_order, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.trip_id, s.destination, s.stop_order, s.notes ?? null, ts, ts]
      );
    }
  });
}

async function resetAndSeed(db: SQLite.SQLiteDatabase): Promise<void> {
  // Keep it deterministic for local-mode development: drop and re-create from seed.
  await execBatch(
    db,
    `
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS trip_stops;
    DROP TABLE IF EXISTS trips;
    DROP TABLE IF EXISTS vehicles;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS meta;
    PRAGMA foreign_keys = ON;
    `
  );

  await execBatch(db, CREATE_TABLES_SQL);
  await seedFromJson(db);
  await writeVersions(db);
}

export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await getDb();
    await execBatch(db, CREATE_TABLES_SQL);

    const seeded = await isSeeded(db);

    const schemaVersion = await getMeta(db, 'schema_version');
    const seedVersion = await getMeta(db, 'seed_version');

    // If schema changes, always rebuild. If seed data changes, rebuild in dev so changes apply immediately.
    const shouldReset =
      schemaVersion !== String(SCHEMA_VERSION) || (__DEV__ && seedVersion !== String(SEED_VERSION));

    if (!seeded || shouldReset) {
      await resetAndSeed(db);
      return;
    }

    // Backfill meta on older DBs that were seeded before we added it.
    if (!schemaVersion || !seedVersion) {
      await writeVersions(db);
    }
  })();

  return initPromise;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  // allow init to run again if callers reset mid-session
  initPromise = null;
  await resetAndSeed(db);
}

