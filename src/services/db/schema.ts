export const SCHEMA_VERSION = 2;

// Minimal schema to replace Laravel backend tables used by the app.
// Mirrors migrations in `mda/database/migrations/*create_*_table.php` (+ add_location_to_users_table).
export const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  manager_id INTEGER NULL,
  role_id INTEGER NOT NULL DEFAULT 4,
  password TEXT NOT NULL,
  last_latitude REAL NULL,
  last_longitude REAL NULL,
  last_location_at TEXT NULL,
  created_at TEXT NULL,
  updated_at TEXT NULL,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY,
  registration_number TEXT UNIQUE NULL,
  notes TEXT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  manager_id INTEGER NOT NULL,
  created_at TEXT NULL,
  updated_at TEXT NULL,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY,
  trip_number TEXT NOT NULL UNIQUE,
  vehicle_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  a_code TEXT NULL,
  destination_from TEXT NOT NULL,
  destination_to TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  mileage REAL NULL,
  cmr TEXT NULL,
  driver_description TEXT NULL,
  admin_description TEXT NULL,
  trip_date TEXT NOT NULL,
  invoice_number TEXT NULL,
  amount REAL NULL,
  created_by INTEGER NULL,
  created_at TEXT NULL,
  updated_at TEXT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_trips_trip_number ON trips(trip_number);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_trip_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

CREATE TABLE IF NOT EXISTS trip_stops (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER NOT NULL,
  destination TEXT NOT NULL,
  stop_order INTEGER NOT NULL DEFAULT 1,
  notes TEXT NULL,
  created_at TEXT NULL,
  updated_at TEXT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_order ON trip_stops(trip_id, stop_order);
`;

