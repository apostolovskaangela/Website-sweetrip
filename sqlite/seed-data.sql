-- Seed Data for MDA SQLite Database

-- Roles
INSERT OR IGNORE INTO roles (id, name, guard_name, created_at, updated_at) VALUES
(1, 'ceo', 'web', datetime('now'), datetime('now')),
(2, 'manager', 'web', datetime('now'), datetime('now')),
(3, 'admin', 'web', datetime('now'), datetime('now')),
(4, 'driver', 'web', datetime('now'), datetime('now'));

-- Users
-- CEO User
INSERT OR IGNORE INTO users (id, name, email, role_id, password, manager_id, created_at, updated_at) VALUES
(1, 'CEO', 'ceo@example.com', 1, '$2y$12$9FbVcqPRPwkK5lv3c.lLO.tV6j0n7Z4q1c3QqQ5hQ7z4N8Z2B9Loe', NULL, datetime('now'), datetime('now'));

-- Manager Users
INSERT OR IGNORE INTO users (id, name, email, role_id, password, manager_id, created_at, updated_at) VALUES
(2, 'Manager', 'jovan@example.com', 2, '$2y$12$9FbVcqPRPwkK5lv3c.lLO.tV6j0n7Z4q1c3QqQ5hQ7z4N8Z2B9Loe', NULL, datetime('now'), datetime('now')),
(3, 'Manager', 'kenan@example.com', 2, '$2y$12$9FbVcqPRPwkK5lv3c.lLO.tV6j0n7Z4q1c3QqQ5hQ7z4N8Z2B9Loe', NULL, datetime('now'), datetime('now'));

-- Admin User
INSERT OR IGNORE INTO users (id, name, email, role_id, password, manager_id, created_at, updated_at) VALUES
(4, 'Admin', 'admin@example.com', 3, '$2y$12$9FbVcqPRPwkK5lv3c.lLO.tV6j0n7Z4q1c3QqQ5hQ7z4N8Z2B9Loe', NULL, datetime('now'), datetime('now'));

-- Driver Users
INSERT OR IGNORE INTO users (id, name, email, role_id, password, manager_id, created_at, updated_at) VALUES
(5, 'Angelique', 'angelique@example.com', 4, '$2y$12$9FbVcqPRPwkK5lv3c.lLO.tV6j0n7Z4q1c3QqQ5hQ7z4N8Z2B9Loe', 2, datetime('now'), datetime('now')),
(6, 'Nellie', 'nellie@example.com', 4, '$2y$12$9FbVcqPRPwkK5lv3c.lLO.tV6j0n7Z4q1c3QqQ5hQ7z4N8Z2B9Loe', 2, datetime('now'), datetime('now')),
(7, 'Embla', 'embla@example.com', 4, '$2y$12$9FbVcqPRPwkK5lv3c.lLO.tV6j0n7Z4q1c3QqQ5hQ7z4N8Z2B9Loe', 3, datetime('now'), datetime('now'));

-- Model Has Roles (Assign roles to users)
INSERT OR IGNORE INTO model_has_roles (role_id, model_type, model_id) VALUES
(1, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(2, 'App\\Models\\User', 3),
(3, 'App\\Models\\User', 4),
(4, 'App\\Models\\User', 5),
(4, 'App\\Models\\User', 6),
(4, 'App\\Models\\User', 7);

-- Vehicles
INSERT OR IGNORE INTO vehicles (id, registration_number, notes, is_active, manager_id, created_at, updated_at) VALUES
(1, 'ABC-123', 'Main company vehicle', 1, 2, datetime('now'), datetime('now')),
(2, 'XYZ-789', 'Secondary vehicle', 1, 2, datetime('now'), datetime('now')),
(3, 'MNO-456', 'Third vehicle', 1, 3, datetime('now'), datetime('now'));

-- Sample Trips
INSERT OR IGNORE INTO trips (id, trip_number, vehicle_id, driver_id, destination_from, destination_to, status, trip_date, created_by, created_at, updated_at) VALUES
(1, 'TRIP-001', 1, 5, 'Sarajevo', 'Mostar', 'not_started', '2026-02-01', 2, datetime('now'), datetime('now')),
(2, 'TRIP-002', 2, 6, 'Tuzla', 'Zenica', 'in_progress', '2026-02-01', 2, datetime('now'), datetime('now')),
(3, 'TRIP-003', 3, 7, 'Banja Luka', 'Prijedor', 'completed', '2025-01-31', 3, datetime('now'), datetime('now'));

-- Sample Trip Stops
INSERT OR IGNORE INTO trip_stops (id, trip_id, destination, stop_order, notes, created_at, updated_at) VALUES
(1, 1, 'Konjic', 1, 'First stop', datetime('now'), datetime('now')),
(2, 1, 'Jablanica', 2, 'Second stop', datetime('now'), datetime('now')),
(3, 2, 'Vitez', 1, 'Single stop', datetime('now'), datetime('now')),
(4, 3, 'Banja Luka', 1, 'Final destination', datetime('now'), datetime('now'));
