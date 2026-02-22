# SQLite Local Database Migration

## Overview
Your project has been migrated from a remote API backend to use a local SQLite database with a `db.json` seed file. All data operations now use the local in-memory database instead of making HTTP requests.

## What Changed

### 1. **Database Initialization** (`app/App.tsx`)
- Added automatic database initialization on app startup
- Database is loaded from `public/api/db.json`
- All subsequent operations use the in-memory data

### 2. **Data Service** (`src/lib/sqlite/dataService.ts`)
- New local data service that replaces API calls
- Implements full CRUD operations for:
  - Users
  - Vehicles
  - Trips
  - Trip Stops
  - Roles
- In-memory storage with automatic ID generation

### 3. **API Service Updates**
All API services now use the local data service instead of axios:
- ✅ `src/services/api/trips.ts`
- ✅ `src/services/api/vehicles.ts`
- ✅ `src/services/api/users.ts`
- ✅ `src/services/api/auth.ts` (local login with no password verification in dev)
- ✅ `src/services/api/dashboard.ts`

### 4. **Models** (`src/lib/sqlite/models.ts`)
- TypeScript interfaces for all entities
- Support for relationships between entities

### 5. **Seed Data** (`public/api/db.json`)
- Contains initial data with:
  - 7 users (1 CEO, 2 managers, 1 admin, 3 drivers)
  - 3 vehicles
  - 3 sample trips
  - 4 trip stops
  - 4 roles

## How to Use

### Basic Data Operations

All data operations are async and can be imported from `src/lib/sqlite/dataService`:

```typescript
import * as dataService from '@/src/lib/sqlite/dataService';

// Get all trips
const trips = await dataService.getAllTrips();

// Get specific trip
const trip = await dataService.getTripById(1);

// Create new trip
const newTrip = await dataService.createTrip({
  trip_number: 'TRIP-004',
  vehicle_id: 1,
  driver_id: 5,
  destination_from: 'City A',
  destination_to: 'City B',
  status: 'not_started',
  trip_date: '2026-02-01',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Update trip
const updated = await dataService.updateTrip(1, {
  status: 'in_progress'
});

// Delete trip
await dataService.deleteTrip(1);
```

### Available Functions

#### Users
- `getAllUsers()`
- `getUserById(id)`
- `getUserByEmail(email)`
- `getUsersByRole(roleId)`
- `getDrivers()`
- `getManagers()`
- `createUser(user)`
- `updateUser(id, updates)`
- `deleteUser(id)`

#### Vehicles
- `getAllVehicles()`
- `getVehicleById(id)`
- `getVehiclesByManager(managerId)`
- `getActiveVehicles()`
- `createVehicle(vehicle)`
- `updateVehicle(id, updates)`
- `deleteVehicle(id)`

#### Trips
- `getAllTrips()`
- `getTripById(id)`
- `getTripByNumber(tripNumber)`
- `getTripsByDriver(driverId)`
- `getTripsByVehicle(vehicleId)`
- `getTripsByStatus(status)`
- `getTripsByDate(date)`
- `getTripsByDateRange(startDate, endDate)`
- `createTrip(trip)`
- `updateTrip(id, updates)`
- `deleteTrip(id)`
- `updateTripStatus(id, status)`
- `getTripWithRelations(id)` - Returns trip with driver, vehicle, stops
- `getActiveTripsForManager(managerId)`

#### Trip Stops
- `getTripStopsByTrip(tripId)`
- `createTripStop(stop)`
- `updateTripStop(id, updates)`
- `deleteTripStop(id)`

#### Roles
- `getAllRoles()`
- `getRoleById(id)`
- `getRoleByName(name)`

### Login Credentials

For development, password verification is disabled. Use any of these emails:
- **CEO**: `ceo@example.com`
- **Managers**: `jovan@example.com`, `kenan@example.com`
- **Admin**: `admin@example.com`
- **Drivers**: `angelique@example.com`, `nellie@example.com`, `embla@example.com`

Password can be anything in development mode (any non-empty string).

## React Query Integration

The existing React Query hooks will continue to work as before. They now fetch from the local data service through the updated API service layer:

```typescript
import { useTripQuery } from '@/src/hooks/queries/useTripQuery';

function MyComponent() {
  const { data: trip, isLoading } = useTripQuery(1);
  
  return (
    <View>
      {isLoading && <Text>Loading...</Text>}
      {trip && <Text>{trip.trip_number}</Text>}
    </View>
  );
}
```

## File Structure

```
src/lib/sqlite/
├── models.ts          # TypeScript interfaces
└── dataService.ts     # Local data operations

public/api/
└── db.json           # Seed data file

app/
└── App.tsx           # Initialization added
```

## Adding New Seed Data

To add more seed data, edit `public/api/db.json` following the existing structure:

```json
{
  "users": [
    {
      "id": 8,
      "name": "New User",
      "email": "new@example.com",
      "manager_id": 2,
      "role_id": 4,
      "password": "...",
      "created_at": "2026-02-01T00:00:00Z",
      "updated_at": "2026-02-01T00:00:00Z"
    }
  ],
  "vehicles": [...],
  "trips": [...],
  "trip_stops": [...],
  "roles": [...]
}
```

The IDs will be automatically incremented for new records created through the API.

## Notes

1. **In-Memory Storage**: Data is stored in memory and will be reset when the app reloads. This is suitable for development/testing.

2. **No Backend Required**: You no longer need a running backend server. The app works completely offline.

3. **Scalability**: For production, you may want to:
   - Use SQLite with persistence (expo-sqlite)
   - Sync with a backend server
   - Implement proper data persistence

4. **Location Tracking**: The `useLiveDrivers` hook still references the API. You may want to implement a mock for this or connect it to a real-time service.

## Future Enhancements

To persist data between app sessions:
1. Switch to `expo-sqlite` for persistent storage
2. Update `dataService.ts` to use SQLite queries instead of in-memory operations
3. Implement database schema and migrations

See the `sqlite/` folder documentation for SQLite implementation details.
