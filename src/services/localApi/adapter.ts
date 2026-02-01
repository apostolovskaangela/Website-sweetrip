import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';

import { getDb, initDatabase } from '@/src/services/db';
import { fromSqlBool, nowIso, roleIdToRoleName, toSqlBool } from '@/src/services/db/utils';

function normalizePath(url: string | undefined): { path: string; query: URLSearchParams } {
  const raw = url ?? '';
  // Support "/trips", "http://x/api/trips", or even "local://api/trips"
  const u = new URL(raw, 'http://local');
  return { path: u.pathname.replace(/\/+$/, '') || '/', query: u.searchParams };
}

function statusLabel(status: string): string {
  switch (status) {
    case 'not_started':
      return 'Not Started';
    case 'in_process':
      return 'In Process';
    case 'started':
      return 'Started';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

function extractBearer(headers: AxiosRequestConfig['headers']): string | null {
  const anyHeaders: any = headers ?? {};
  const auth = anyHeaders.Authorization ?? anyHeaders.authorization;
  if (!auth || typeof auth !== 'string') return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function tokenToUserId(token: string | null): number | null {
  if (!token) return null;
  // tokens are issued as "local:<id>"
  const m = token.match(/local:(\d+)/);
  if (m) return Number(m[1]);
  // compatibility with older local tokens used in this repo: "local_token_<id>_<timestamp>"
  const m2 = token.match(/local_token_(\d+)_/);
  if (m2) return Number(m2[1]);
  // allow raw numeric tokens in dev
  if (/^\d+$/.test(token)) return Number(token);
  return null;
}

async function getAuthedUser() {
  const db = await getDb();
  return async (headers: AxiosRequestConfig['headers']) => {
    const token = extractBearer(headers);
    const userId = tokenToUserId(token);
    if (!userId) return null;
    const row = await db.getFirstAsync<any>('SELECT * FROM users WHERE id = ?', [userId]);
    if (!row) return null;
    return {
      id: Number(row.id),
      name: String(row.name),
      email: String(row.email),
      roles: [roleIdToRoleName(Number(row.role_id))],
      role_id: Number(row.role_id),
      manager_id: row.manager_id != null ? Number(row.manager_id) : null,
    };
  };
}

function ok<T>(config: AxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  // Axios' adapter types expect InternalAxiosRequestConfig for `response.config`,
  // but adapters are also invoked with AxiosRequestConfig. Cast for compatibility.
  return {
    data,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'ERROR',
    headers: {},
    config: config as any,
    request: {},
  } as unknown as AxiosResponse<T>;
}

export const localAxiosAdapter: AxiosAdapter = async (config) => {
  await initDatabase();
  const db = await getDb();
  const authedUserFn = await getAuthedUser();

  const method = (config.method ?? 'get').toLowerCase();
  const { path } = normalizePath(config.url);

  // axios sometimes passes params separately
  const params: any = config.params ?? {};
  const body: any =
    typeof config.data === 'string'
      ? (() => {
          try {
            return JSON.parse(config.data);
          } catch {
            return config.data;
          }
        })()
      : config.data;

  const currentUser = await authedUserFn(config.headers);

  // -----------------------
  // Auth
  // -----------------------
  if (method === 'post' && path === '/login') {
    const email = body?.email;
    const password = body?.password;
    if (!email || !password) return ok(config, { message: 'Invalid credentials' } as any, 422);

    const row = await db.getFirstAsync<any>('SELECT * FROM users WHERE email = ?', [email]);
    if (!row || String(row.password) !== String(password)) {
      return ok(config, { message: 'Invalid credentials' } as any, 401);
    }

    const user = {
      id: Number(row.id),
      name: String(row.name),
      email: String(row.email),
      roles: [roleIdToRoleName(Number(row.role_id))],
    };
    return ok(config, { user, token: `local:${user.id}` } as any, 200);
  }

  if (method === 'post' && path === '/logout') {
    return ok(config, { message: 'Logged out successfully.' } as any, 200);
  }

  if (method === 'get' && path === '/user') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    return ok(config, {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      roles: currentUser.roles,
    } as any);
  }

  // -----------------------
  // Helpers for access scope
  // -----------------------
  async function getAccessibleDriverIds(): Promise<number[] | null> {
    if (!currentUser) return null;

    const role = currentUser.roles[0];
    if (role === 'driver') return [currentUser.id];
    if (role === 'manager') {
      const rows = await db.getAllAsync<any>('SELECT id FROM users WHERE manager_id = ?', [currentUser.id]);
      return rows.map((r) => Number(r.id));
    }
    // admin/ceo can see all trips
    return null;
  }

  async function getAccessibleVehicleIds(): Promise<number[] | null> {
    if (!currentUser) return null;
    const role = currentUser.roles[0];
    if (role === 'manager') {
      const rows = await db.getAllAsync<any>('SELECT id FROM vehicles WHERE manager_id = ?', [currentUser.id]);
      return rows.map((r) => Number(r.id));
    }
    // admin/ceo/driver can see vehicles list in UI; keep open unless you want strictness
    return null;
  }

  async function buildTripObject(tripRow: any, includeStops: boolean) {
    const tripId = Number(tripRow.id);
    const stops = includeStops
      ? await db.getAllAsync<any>(
          'SELECT id, destination, stop_order, notes FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC, id ASC',
          [tripId]
        )
      : [];

    return {
      id: tripId,
      trip_number: String(tripRow.trip_number),
      status: String(tripRow.status),
      status_label: statusLabel(String(tripRow.status)),
      trip_date: String(tripRow.trip_date),
      destination_from: String(tripRow.destination_from),
      destination_to: String(tripRow.destination_to),
      mileage: tripRow.mileage != null ? Number(tripRow.mileage) : 0,
      a_code: tripRow.a_code ?? undefined,
      driver_description: tripRow.driver_description ?? undefined,
      admin_description: tripRow.admin_description ?? undefined,
      invoice_number: tripRow.invoice_number ?? undefined,
      amount: tripRow.amount != null ? Number(tripRow.amount) : undefined,
      cmr: tripRow.cmr ?? null,
      cmr_url: tripRow.cmr ?? null,
      driver: tripRow.driver_id
        ? {
            id: Number(tripRow.driver_id),
            name: String(tripRow.driver_name ?? ''),
            email: String(tripRow.driver_email ?? ''),
          }
        : undefined,
      vehicle: tripRow.vehicle_id
        ? {
            id: Number(tripRow.vehicle_id),
            registration_number: String(tripRow.vehicle_registration ?? ''),
          }
        : undefined,
      stops: includeStops
        ? stops.map((s) => ({
            id: Number(s.id),
            destination: String(s.destination),
            stop_order: Number(s.stop_order),
            notes: s.notes ?? undefined,
          }))
        : undefined,
    };
  }

  // -----------------------
  // Trips
  // -----------------------
  if (method === 'get' && path === '/trips') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);

    const page = Number(params?.page ?? 1) || 1;
    const perPage = 15;
    const offset = (page - 1) * perPage;

    const accessibleDriverIds = await getAccessibleDriverIds();
    const where =
      accessibleDriverIds && accessibleDriverIds.length > 0
        ? `WHERE t.driver_id IN (${accessibleDriverIds.map(() => '?').join(',')})`
        : '';
    const args = accessibleDriverIds ?? [];

    const countRow = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM trips t ${where}`,
      args
    );
    const total = countRow?.cnt ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    const rows = await db.getAllAsync<any>(
      `
      SELECT
        t.*,
        u.name AS driver_name,
        u.email AS driver_email,
        v.registration_number AS vehicle_registration
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      JOIN vehicles v ON v.id = t.vehicle_id
      ${where}
      ORDER BY t.trip_date DESC, t.id DESC
      LIMIT ? OFFSET ?
      `,
      [...args, perPage, offset]
    );

    const trips = await Promise.all(rows.map((r) => buildTripObject(r, false)));

    return ok(config, {
      trips,
      pagination: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
      },
    } as any);
  }

  const tripIdMatch = path.match(/^\/trips\/(\d+)$/);
  if (method === 'get' && tripIdMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(tripIdMatch[1]);

    const accessibleDriverIds = await getAccessibleDriverIds();
    const row = await db.getFirstAsync<any>(
      `
      SELECT
        t.*,
        u.name AS driver_name,
        u.email AS driver_email,
        v.registration_number AS vehicle_registration
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      JOIN vehicles v ON v.id = t.vehicle_id
      WHERE t.id = ?
      `,
      [id]
    );
    if (!row) return ok(config, { message: 'Not found' } as any, 404);

    if (accessibleDriverIds && !accessibleDriverIds.includes(Number(row.driver_id))) {
      return ok(config, { message: 'Forbidden' } as any, 403);
    }

    const trip = await buildTripObject(row, true);
    return ok(config, { trip } as any);
  }

  if (method === 'get' && path === '/trips/create') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);

    const role = currentUser.roles[0];
    const drivers =
      role === 'manager'
        ? await db.getAllAsync<any>(
            'SELECT id, name, email FROM users WHERE role_id = 4 AND manager_id = ? ORDER BY name ASC',
            [currentUser.id]
          )
        : await db.getAllAsync<any>(
            'SELECT id, name, email FROM users WHERE role_id = 4 ORDER BY name ASC'
          );

    const vehicles =
      role === 'manager'
        ? await db.getAllAsync<any>(
            'SELECT id, registration_number, is_active FROM vehicles WHERE manager_id = ? ORDER BY id DESC',
            [currentUser.id]
          )
        : await db.getAllAsync<any>('SELECT id, registration_number, is_active FROM vehicles ORDER BY id DESC');

    return ok(config, {
      drivers: drivers.map((d) => ({ id: Number(d.id), name: String(d.name), email: String(d.email) })),
      vehicles: vehicles.map((v) => ({
        id: Number(v.id),
        registration_number: String(v.registration_number),
        is_active: fromSqlBool(v.is_active),
      })),
    } as any);
  }

  if (method === 'post' && path === '/trips') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);

    const ts = nowIso();
    const {
      trip_number,
      vehicle_id,
      driver_id,
      a_code,
      destination_from,
      destination_to,
      status,
      mileage,
      driver_description,
      admin_description,
      trip_date,
      invoice_number,
      amount,
      stops,
    } = body ?? {};

    if (!trip_number || !vehicle_id || !driver_id || !destination_from || !destination_to || !trip_date) {
      return ok(config, { message: 'Validation failed' } as any, 422);
    }

    const insert = await db.runAsync(
      `INSERT INTO trips
        (trip_number, vehicle_id, driver_id, a_code, destination_from, destination_to, status, mileage, cmr, driver_description, admin_description, trip_date, invoice_number, amount, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip_number,
        Number(vehicle_id),
        Number(driver_id),
        a_code ?? null,
        destination_from,
        destination_to,
        status ?? 'not_started',
        mileage ?? null,
        null,
        driver_description ?? null,
        admin_description ?? null,
        trip_date,
        invoice_number ?? null,
        amount ?? null,
        currentUser.id,
        ts,
        ts,
      ]
    );
    const newId = Number(insert.lastInsertRowId);

    if (Array.isArray(stops)) {
      for (const s of stops) {
        if (!s?.destination) continue;
        await db.runAsync(
          `INSERT INTO trip_stops (trip_id, destination, stop_order, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [newId, s.destination, Number(s.stop_order ?? 1), s.notes ?? null, ts, ts]
        );
      }
    }

    // Return the full trip structure
    const row = await db.getFirstAsync<any>(
      `
      SELECT
        t.*,
        u.name AS driver_name,
        u.email AS driver_email,
        v.registration_number AS vehicle_registration
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      JOIN vehicles v ON v.id = t.vehicle_id
      WHERE t.id = ?
      `,
      [newId]
    );
    const trip = await buildTripObject(row, true);
    return ok(config, { message: 'Trip created successfully.', trip } as any, 201);
  }

  const tripPutMatch = path.match(/^\/trips\/(\d+)$/);
  if (method === 'put' && tripPutMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(tripPutMatch[1]);

    const existing = await db.getFirstAsync<any>('SELECT id FROM trips WHERE id = ?', [id]);
    if (!existing) return ok(config, { message: 'Not found' } as any, 404);

    const ts = nowIso();
    const updatable: Record<string, any> = {};
    const fields = [
      'trip_number',
      'vehicle_id',
      'driver_id',
      'a_code',
      'destination_from',
      'destination_to',
      'status',
      'mileage',
      'driver_description',
      'admin_description',
      'trip_date',
      'invoice_number',
      'amount',
    ] as const;

    for (const f of fields) {
      if (body?.[f] !== undefined) updatable[f] = body[f];
    }

    const setClauses = Object.keys(updatable).map((k) => `${k} = ?`);
    const args = Object.keys(updatable).map((k) => updatable[k]);

    if (setClauses.length > 0) {
      await db.runAsync(
        `UPDATE trips SET ${setClauses.join(', ')}, updated_at = ? WHERE id = ?`,
        [...args, ts, id]
      );
    }

    if (Array.isArray(body?.stops)) {
      await db.runAsync('DELETE FROM trip_stops WHERE trip_id = ?', [id]);
      for (const s of body.stops) {
        if (!s?.destination) continue;
        await db.runAsync(
          `INSERT INTO trip_stops (trip_id, destination, stop_order, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, s.destination, Number(s.stop_order ?? 1), s.notes ?? null, ts, ts]
        );
      }
    }

    const row = await db.getFirstAsync<any>(
      `
      SELECT
        t.*,
        u.name AS driver_name,
        u.email AS driver_email,
        v.registration_number AS vehicle_registration
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      JOIN vehicles v ON v.id = t.vehicle_id
      WHERE t.id = ?
      `,
      [id]
    );
    const trip = await buildTripObject(row, true);
    return ok(config, { message: 'Trip updated successfully.', trip } as any, 200);
  }

  const tripDeleteMatch = path.match(/^\/trips\/(\d+)$/);
  if (method === 'delete' && tripDeleteMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(tripDeleteMatch[1]);
    await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
    return ok(config, { message: 'Trip deleted successfully.' } as any, 200);
  }

  const driverStatusMatch = path.match(/^\/driver\/trips\/(\d+)\/status$/);
  if (method === 'post' && driverStatusMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(driverStatusMatch[1]);
    const newStatus = body?.status;
    if (!newStatus) return ok(config, { message: 'Validation failed' } as any, 422);
    await db.runAsync('UPDATE trips SET status = ?, updated_at = ? WHERE id = ?', [newStatus, nowIso(), id]);
    return ok(config, {
      message: 'Trip status updated successfully.',
      trip: { id, status: newStatus, status_label: statusLabel(newStatus) },
    } as any);
  }

  const cmrMatch1 = path.match(/^\/driver\/trips\/(\d+)\/cmr$/);
  const cmrMatch2 = path.match(/^\/trips\/(\d+)\/cmr$/);
  if (method === 'post' && (cmrMatch1 || cmrMatch2)) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number((cmrMatch1 ?? cmrMatch2)![1]);

    // In local mode we accept a JSON body: { cmr: string } (file uri/path)
    const cmr = body?.cmr ?? null;
    await db.runAsync('UPDATE trips SET cmr = ?, updated_at = ? WHERE id = ?', [cmr, nowIso(), id]);

    const row = await db.getFirstAsync<any>(
      `
      SELECT
        t.*,
        u.name AS driver_name,
        u.email AS driver_email,
        v.registration_number AS vehicle_registration
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      JOIN vehicles v ON v.id = t.vehicle_id
      WHERE t.id = ?
      `,
      [id]
    );
    const trip = await buildTripObject(row, true);
    return ok(config, { message: 'CMR uploaded successfully.', trip } as any, 200);
  }

  // -----------------------
  // Vehicles
  // -----------------------
  if (method === 'get' && path === '/vehicles') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const accessibleVehicleIds = await getAccessibleVehicleIds();
    const where =
      accessibleVehicleIds && accessibleVehicleIds.length > 0
        ? `WHERE v.id IN (${accessibleVehicleIds.map(() => '?').join(',')})`
        : '';
    const args = accessibleVehicleIds ?? [];

    const rows = await db.getAllAsync<any>(
      `
      SELECT v.*
      FROM vehicles v
      ${where}
      ORDER BY v.id DESC
      `,
      args
    );
    return ok(config, {
      vehicles: rows.map((r) => ({
        id: Number(r.id),
        registration_number: String(r.registration_number),
        notes: r.notes ?? undefined,
        is_active: fromSqlBool(r.is_active),
        manager_id: r.manager_id != null ? Number(r.manager_id) : undefined,
      })),
    } as any);
  }

  const vehicleGetMatch = path.match(/^\/vehicles\/(\d+)$/);
  if (method === 'get' && vehicleGetMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(vehicleGetMatch[1]);
    const row = await db.getFirstAsync<any>(
      `
      SELECT v.*, u.name AS manager_name, u.email AS manager_email
      FROM vehicles v
      JOIN users u ON u.id = v.manager_id
      WHERE v.id = ?
      `,
      [id]
    );
    if (!row) return ok(config, { message: 'Not found' } as any, 404);

    const trips = await db.getAllAsync<any>(
      `
      SELECT
        t.id, t.trip_number, t.status, t.trip_date,
        d.id AS driver_id, d.name AS driver_name, d.email AS driver_email
      FROM trips t
      JOIN users d ON d.id = t.driver_id
      WHERE t.vehicle_id = ?
      ORDER BY t.trip_date DESC, t.id DESC
      `,
      [id]
    );

    return ok(config, {
      vehicle: {
        id: Number(row.id),
        registration_number: String(row.registration_number),
        notes: row.notes ?? undefined,
        is_active: fromSqlBool(row.is_active),
        manager_id: Number(row.manager_id),
        manager: {
          id: Number(row.manager_id),
          name: String(row.manager_name),
          email: String(row.manager_email),
        },
        trips: trips.map((t) => ({
          id: Number(t.id),
          trip_number: String(t.trip_number),
          status: String(t.status),
          status_label: statusLabel(String(t.status)),
          trip_date: String(t.trip_date),
          driver: {
            id: Number(t.driver_id),
            name: String(t.driver_name),
            email: String(t.driver_email),
          },
        })),
      },
    } as any);
  }

  if (method === 'post' && path === '/vehicles') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const role = currentUser.roles[0];

    const registration_number = body?.registration_number ?? null;
    const notes = body?.notes ?? null;
    const is_active = body?.is_active ?? true;
    const manager_id = role === 'manager' ? currentUser.id : Number(body?.manager_id ?? currentUser.id);
    const ts = nowIso();

    const insert = await db.runAsync(
      `INSERT INTO vehicles (registration_number, notes, is_active, manager_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [registration_number, notes, toSqlBool(Boolean(is_active)), manager_id, ts, ts]
    );

    const vehicleId = Number(insert.lastInsertRowId);
    const created = await db.getFirstAsync<any>('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    return ok(config, { message: 'Vehicle created successfully.', vehicle: {
      id: Number(created.id),
      registration_number: String(created.registration_number),
      notes: created.notes ?? undefined,
      is_active: fromSqlBool(created.is_active),
      manager_id: created.manager_id != null ? Number(created.manager_id) : undefined,
    } } as any, 201);
  }

  const vehiclePutMatch = path.match(/^\/vehicles\/(\d+)$/);
  if (method === 'put' && vehiclePutMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(vehiclePutMatch[1]);
    const existing = await db.getFirstAsync<any>('SELECT id FROM vehicles WHERE id = ?', [id]);
    if (!existing) return ok(config, { message: 'Not found' } as any, 404);

    const ts = nowIso();
    const updatable: Record<string, any> = {};
    for (const k of ['registration_number', 'notes', 'is_active', 'manager_id'] as const) {
      if (body?.[k] !== undefined) {
        updatable[k] = k === 'is_active' ? toSqlBool(Boolean(body[k])) : body[k];
      }
    }
    const setClauses = Object.keys(updatable).map((k) => `${k} = ?`);
    const args = Object.keys(updatable).map((k) => updatable[k]);

    if (setClauses.length > 0) {
      await db.runAsync(`UPDATE vehicles SET ${setClauses.join(', ')}, updated_at = ? WHERE id = ?`, [
        ...args,
        ts,
        id,
      ]);
    }

    const updated = await db.getFirstAsync<any>('SELECT * FROM vehicles WHERE id = ?', [id]);
    return ok(config, { message: 'Vehicle updated successfully.', vehicle: {
      id: Number(updated.id),
      registration_number: String(updated.registration_number),
      notes: updated.notes ?? undefined,
      is_active: fromSqlBool(updated.is_active),
      manager_id: updated.manager_id != null ? Number(updated.manager_id) : undefined,
    } } as any, 200);
  }

  const vehicleDeleteMatch = path.match(/^\/vehicles\/(\d+)$/);
  if (method === 'delete' && vehicleDeleteMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(vehicleDeleteMatch[1]);
    const tripCnt = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM trips WHERE vehicle_id = ?', [
      id,
    ]);
    if ((tripCnt?.cnt ?? 0) > 0) {
      return ok(config, { message: 'Vehicle has trips' } as any, 422);
    }
    await db.runAsync('DELETE FROM vehicles WHERE id = ?', [id]);
    return ok(config, { message: 'Vehicle deleted successfully.' } as any, 200);
  }

  // -----------------------
  // Users
  // -----------------------
  if (method === 'get' && path === '/users') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const rows = await db.getAllAsync<any>('SELECT id, name, email, role_id, manager_id FROM users ORDER BY id ASC');
    return ok(config, {
      users: rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        email: String(r.email),
        roles: [roleIdToRoleName(Number(r.role_id))],
        manager_id: r.manager_id != null ? Number(r.manager_id) : undefined,
      })),
    } as any);
  }

  if (method === 'post' && path === '/users') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const roleName = String(body?.role ?? 'driver');
    const roleId = roleName === 'ceo' ? 1 : roleName === 'manager' ? 2 : roleName === 'admin' ? 3 : 4;
    const ts = nowIso();
    const insert = await db.runAsync(
      `INSERT INTO users (name, email, password, role_id, manager_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [body?.name ?? '', body?.email ?? '', body?.password ?? '', roleId, body?.manager_id ?? null, ts, ts]
    );
    const id = Number(insert.lastInsertRowId);
    const row = await db.getFirstAsync<any>('SELECT id, name, email, role_id, manager_id FROM users WHERE id = ?', [id]);
    return ok(config, {
      id: Number(row.id),
      name: String(row.name),
      email: String(row.email),
      roles: [roleIdToRoleName(Number(row.role_id))],
      manager_id: row.manager_id != null ? Number(row.manager_id) : undefined,
    } as any, 201);
  }

  const userPutMatch = path.match(/^\/users\/(\d+)$/);
  if (method === 'put' && userPutMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(userPutMatch[1]);
    const existing = await db.getFirstAsync<any>('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing) return ok(config, { message: 'Not found' } as any, 404);

    const ts = nowIso();
    const updatable: Record<string, any> = {};
    if (body?.name !== undefined) updatable.name = body.name;
    if (body?.email !== undefined) updatable.email = body.email;
    if (body?.password !== undefined && body.password) updatable.password = body.password;
    if (body?.manager_id !== undefined) updatable.manager_id = body.manager_id;
    if (body?.role !== undefined) {
      const roleName = String(body.role);
      updatable.role_id = roleName === 'ceo' ? 1 : roleName === 'manager' ? 2 : roleName === 'admin' ? 3 : 4;
    }

    const setClauses = Object.keys(updatable).map((k) => `${k} = ?`);
    const args = Object.keys(updatable).map((k) => updatable[k]);
    if (setClauses.length > 0) {
      await db.runAsync(`UPDATE users SET ${setClauses.join(', ')}, updated_at = ? WHERE id = ?`, [
        ...args,
        ts,
        id,
      ]);
    }

    const row = await db.getFirstAsync<any>('SELECT id, name, email, role_id, manager_id FROM users WHERE id = ?', [id]);
    return ok(config, {
      id: Number(row.id),
      name: String(row.name),
      email: String(row.email),
      roles: [roleIdToRoleName(Number(row.role_id))],
      manager_id: row.manager_id != null ? Number(row.manager_id) : undefined,
    } as any, 200);
  }

  const userDeleteMatch = path.match(/^\/users\/(\d+)$/);
  if (method === 'delete' && userDeleteMatch) {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const id = Number(userDeleteMatch[1]);
    await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
    return ok(config, { message: 'User deleted successfully.' } as any, 200);
  }

  // -----------------------
  // Dashboard
  // -----------------------
  if (method === 'get' && path === '/dashboard') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);

    const accessibleDriverIds = await getAccessibleDriverIds();
    const whereTrips =
      accessibleDriverIds && accessibleDriverIds.length > 0
        ? `WHERE t.driver_id IN (${accessibleDriverIds.map(() => '?').join(',')})`
        : '';
    const argsTrips = accessibleDriverIds ?? [];

    const today = new Date().toISOString().slice(0, 10);
    const activeTripsRow = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM trips t ${whereTrips}${whereTrips ? ' AND' : ' WHERE'} t.status != 'completed'`,
      argsTrips
    );

    const distanceRow = await db.getFirstAsync<{ sum: number | null }>(
      `SELECT SUM(mileage) as sum FROM trips t ${whereTrips}${whereTrips ? ' AND' : ' WHERE'} t.trip_date = ?`,
      [...argsTrips, today]
    );

    const vehiclesWhereIds = await getAccessibleVehicleIds();
    const whereVehicles =
      vehiclesWhereIds && vehiclesWhereIds.length > 0
        ? `WHERE id IN (${vehiclesWhereIds.map(() => '?').join(',')})`
        : '';
    const argsVehicles = vehiclesWhereIds ?? [];
    const totalVehiclesRow = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM vehicles ${whereVehicles}`,
      argsVehicles
    );

    const recentRows = await db.getAllAsync<any>(
      `
      SELECT
        t.*,
        u.name AS driver_name,
        u.email AS driver_email,
        v.registration_number AS vehicle_registration
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      JOIN vehicles v ON v.id = t.vehicle_id
      ${whereTrips}
      ORDER BY t.trip_date DESC, t.id DESC
      LIMIT 5
      `,
      argsTrips
    );
    const recent_trips = await Promise.all(recentRows.map((r) => buildTripObject(r, false)));

    const drivers =
      currentUser.roles[0] === 'manager'
        ? await db.getAllAsync<any>(
            'SELECT id, name, email FROM users WHERE role_id = 4 AND manager_id = ? ORDER BY name ASC',
            [currentUser.id]
          )
        : await db.getAllAsync<any>('SELECT id, name, email FROM users WHERE role_id = 4 ORDER BY name ASC');

    const vehicles = await db.getAllAsync<any>(
      `SELECT id, registration_number, is_active FROM vehicles ${whereVehicles} ORDER BY id DESC LIMIT 10`,
      argsVehicles
    );

    // Simple month stats (last 30 days)
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const totalTripsLastMonthRow = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM trips t ${whereTrips}${whereTrips ? ' AND' : ' WHERE'} t.trip_date >= ?`,
      [...argsTrips, monthStart]
    );
    const completedTripsLastMonthRow = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM trips t ${whereTrips}${whereTrips ? ' AND' : ' WHERE'} t.trip_date >= ? AND t.status = 'completed'`,
      [...argsTrips, monthStart]
    );

    const totalTripsLastMonth = totalTripsLastMonthRow?.cnt ?? 0;
    const completedTripsLastMonth = completedTripsLastMonthRow?.cnt ?? 0;
    const efficiency = totalTripsLastMonth > 0 ? (completedTripsLastMonth / totalTripsLastMonth) * 100 : 0;

    return ok(config, {
      stats: {
        active_trips: activeTripsRow?.cnt ?? 0,
        total_vehicles: totalVehiclesRow?.cnt ?? 0,
        distance_today: distanceRow?.sum != null ? Number(distanceRow.sum) : 0,
        efficiency,
        total_trips_last_month: totalTripsLastMonth,
        completed_trips_last_month: completedTripsLastMonth,
      },
      drivers: drivers.map((d) => ({ id: Number(d.id), name: String(d.name), email: String(d.email) })),
      recent_trips,
      vehicles: vehicles.map((v) => ({
        id: Number(v.id),
        registration_number: String(v.registration_number),
        is_active: fromSqlBool(v.is_active),
      })),
    } as any);
  }

  if (method === 'get' && path === '/driver/dashboard') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);

    const driverId = currentUser.id;
    const page = Number(params?.page ?? 1) || 1;
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const totalRow = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM trips WHERE driver_id = ?', [
      driverId,
    ]);
    const completedRow = await db.getFirstAsync<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM trips WHERE driver_id = ? AND status = 'completed'",
      [driverId]
    );
    const pendingRow = await db.getFirstAsync<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM trips WHERE driver_id = ? AND status != 'completed'",
      [driverId]
    );

    const total = totalRow?.cnt ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    const rows = await db.getAllAsync<any>(
      `
      SELECT
        t.*,
        u.name AS driver_name,
        u.email AS driver_email,
        v.registration_number AS vehicle_registration
      FROM trips t
      JOIN users u ON u.id = t.driver_id
      JOIN vehicles v ON v.id = t.vehicle_id
      WHERE t.driver_id = ?
      ORDER BY t.trip_date DESC, t.id DESC
      LIMIT ? OFFSET ?
      `,
      [driverId, perPage, offset]
    );

    const trips = await Promise.all(rows.map((r) => buildTripObject(r, false)));

    return ok(config, {
      stats: {
        total_trips: total,
        completed_trips: completedRow?.cnt ?? 0,
        pending_trips: pendingRow?.cnt ?? 0,
      },
      trips,
      pagination: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total,
      },
    } as any);
  }

  // -----------------------
  // Driver live positions
  // -----------------------
  if (method === 'get' && path === '/driver/live-positions') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const rows = await db.getAllAsync<any>(
      `
      SELECT id, name, role_id, last_latitude, last_longitude, last_location_at
      FROM users
      WHERE last_latitude IS NOT NULL AND last_longitude IS NOT NULL
      ORDER BY last_location_at DESC
      `
    );
    return ok(
      config,
      rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        role: roleIdToRoleName(Number(r.role_id)),
        lat: r.last_latitude,
        lng: r.last_longitude,
        last_location_at: r.last_location_at ?? undefined,
      })) as any
    );
  }

  if (method === 'post' && path === '/driver/update-location') {
    if (!currentUser) return ok(config, { message: 'Unauthorized' } as any, 401);
    const lat = body?.lat;
    const lng = body?.lng;
    if (lat == null || lng == null) return ok(config, { message: 'Validation failed' } as any, 422);
    await db.runAsync(
      'UPDATE users SET last_latitude = ?, last_longitude = ?, last_location_at = ?, updated_at = ? WHERE id = ?',
      [lat, lng, nowIso(), nowIso(), currentUser.id]
    );
    return ok(config, { message: 'Location updated successfully' } as any, 200);
  }

  // Default: 404 for unknown endpoints
  return ok(config, { message: `Not found: ${method.toUpperCase()} ${path}` } as any, 404);
};

