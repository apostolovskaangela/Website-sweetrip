# SQLite Database Setup for React Native MDA App

This directory contains all the SQLite database files and TypeScript models needed to integrate the backend database directly into your React Native application.

## 📁 Files Overview

### Core Database Files

- **`schema.sql`** - Complete SQLite database schema with all tables, constraints, and indexes
- **`seed-data.sql`** - Initial seed data (users, roles, vehicles, trips, etc.)
- **`init.ts`** - Database initialization service with setup and migration logic
- **`models.ts`** - TypeScript interfaces for all database models
- **`repositories.ts`** - Repository pattern implementation for database operations
- **`USAGE_EXAMPLES.tsx`** - Comprehensive examples showing how to use the database

## 🚀 Getting Started

### 1. Installation

First, install required dependencies:

```bash
npm install expo-sqlite expo-file-system
# or
yarn add expo-sqlite expo-file-system
```

### 2. Setup in Your App

Initialize the database in your root component (e.g., `App.tsx`):

```tsx
import React, { useEffect } from 'react';
import { databaseService } from './sqlite/init';

export default function App() {
  useEffect(() => {
    // Initialize database on app start
    databaseService.initialize()
      .then(() => console.log('Database ready'))
      .catch(error => console.error('DB init failed:', error));
  }, []);

  return (
    // Your app components
  );
}
```

### 3. Copy Files to Your Project

Copy the entire `sqlite` directory to your React Native project:

```
your-react-native-app/
├── src/
│   ├── sqlite/
│   │   ├── schema.sql
│   │   ├── seed-data.sql
│   │   ├── init.ts
│   │   ├── models.ts
│   │   ├── repositories.ts
│   │   └── USAGE_EXAMPLES.tsx
│   ├── App.tsx
│   └── ...
```

## 📊 Database Schema

### Tables

#### Users
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `manager_id` - Reference to manager (nullable)
- `role_id` - Role (1=CEO, 2=Manager, 3=Admin, 4=Driver)
- `password` - Bcrypt hashed password
- `timestamps` - created_at, updated_at

#### Vehicles
- `id` - Primary key
- `registration_number` - Unique vehicle registration
- `notes` - Vehicle notes
- `is_active` - Boolean flag
- `manager_id` - Reference to manager user
- `timestamps`

#### Trips
- `id` - Primary key
- `trip_number` - Unique trip identifier
- `vehicle_id` - Reference to vehicle
- `driver_id` - Reference to driver (user)
- `destination_from` - Starting location
- `destination_to` - Ending location
- `status` - not_started | in_progress | completed | cancelled
- `trip_date` - Date of the trip
- `a_code`, `cmr` - Trip codes/documents
- `mileage`, `amount` - Numeric values
- `driver_description`, `admin_description` - Notes
- `created_by` - Reference to creator user
- `timestamps`

#### Trip Stops
- `id` - Primary key
- `trip_id` - Reference to trip
- `destination` - Stop destination
- `stop_order` - Order of the stop
- `notes` - Stop notes
- `timestamps`

#### Roles & Permissions
- `roles` - Role definitions
- `permissions` - Permission definitions
- `model_has_roles` - User-role assignments
- `role_has_permissions` - Role-permission assignments

## 💻 Usage Examples

### Initialize Database

```tsx
import { databaseService } from './sqlite/init';

// Initialize (run once)
await databaseService.initialize();

// Get database connection
const db = databaseService.getDatabase();

// Close database
await databaseService.close();
```

### Using Repositories

```tsx
import { RepositoryFactory } from './sqlite/repositories';
import { databaseService } from './sqlite/init';

const db = databaseService.getDatabase();
const factory = new RepositoryFactory(db);

// Get repositories
const userRepo = factory.getUserRepository();
const tripRepo = factory.getTripRepository();
const vehicleRepo = factory.getVehicleRepository();
const stopRepo = factory.getTripStopRepository();
```

### Query Users

```tsx
// Get all users
const allUsers = await userRepo.findAll();

// Find user by ID
const user = await userRepo.findById(1);

// Find user by email
const userByEmail = await userRepo.findByEmail('driver@example.com');

// Find all drivers
const drivers = await userRepo.findDrivers();

// Find all managers
const managers = await userRepo.findManagers();

// Find drivers managed by specific manager
const managedDrivers = await userRepo.findDriversByManagerId(2);

// Get user with relations (manager, drivers, trips)
const userWithRelations = await userRepo.findWithRelations(1);
```

### Query Vehicles

```tsx
// Get all active vehicles
const activeVehicles = await vehicleRepo.findActive();

// Find vehicle by registration number
const vehicle = await vehicleRepo.findByRegistrationNumber('ABC-123');

// Get vehicles managed by specific manager
const managerVehicles = await vehicleRepo.findByManagerId(2);

// Get vehicle with relations
const vehicleWithRelations = await vehicleRepo.findWithRelations(1);
```

### Query Trips

```tsx
// Get all trips
const allTrips = await tripRepo.findAll();

// Find trip by trip number
const trip = await tripRepo.findByTripNumber('TRIP-001');

// Get trips assigned to driver
const driverTrips = await tripRepo.findByDriverId(5);

// Get trips for vehicle
const vehicleTrips = await tripRepo.findByVehicleId(1);

// Get trips by status
const completedTrips = await tripRepo.findByStatus('completed');
const inProgressTrips = await tripRepo.findByStatus('in_progress');

// Get trips by date
const todayTrips = await tripRepo.findByDate('2026-02-01');

// Get trips by date range
const monthTrips = await tripRepo.findByDateRange('2026-02-01', '2026-02-28');

// Get trip with all relations (driver, vehicle, stops, creator)
const tripWithRelations = await tripRepo.findWithRelations(1);

// Get manager's active trips
const activeTrips = await tripRepo.getActiveTripsByManager(2);

// Update trip status
await tripRepo.updateStatus(1, 'in_progress');
```

### Create Data

```tsx
// Create user
const userId = await userRepo.create({
  name: 'John Doe',
  email: 'john@example.com',
  role_id: 4,
  password: 'hashed_password',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Create vehicle
const vehicleId = await vehicleRepo.create({
  registration_number: 'NEW-123',
  manager_id: 2,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Create trip
const tripId = await tripRepo.create({
  trip_number: 'TRIP-999',
  vehicle_id: 1,
  driver_id: 5,
  destination_from: 'City A',
  destination_to: 'City B',
  trip_date: '2026-02-01',
  status: 'not_started',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Create trip stop
const stopId = await stopRepo.create({
  trip_id: tripId,
  destination: 'Intermediate City',
  stop_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
```

### Update Data

```tsx
// Update user
await userRepo.update(1, {
  name: 'Updated Name',
  updated_at: new Date().toISOString(),
});

// Update vehicle
await vehicleRepo.update(1, {
  is_active: 0,
  updated_at: new Date().toISOString(),
});

// Update trip
await tripRepo.update(1, {
  status: 'completed',
  mileage: 150.5,
  updated_at: new Date().toISOString(),
});
```

### Delete Data

```tsx
// Delete single record
await userRepo.delete(1);
await vehicleRepo.delete(1);
await tripRepo.delete(1);

// Delete all records in table
await userRepo.deleteAll();

// Delete trip stops for a trip
await stopRepo.deleteByTripId(1);
```

## 🔍 Advanced Queries

See `USAGE_EXAMPLES.tsx` for:
- Creating trips with multiple stops
- Getting driver trips with full details
- Getting manager summaries
- Updating trip status
- Searching trips by date range
- Getting dashboard statistics

## 🛡️ Security Notes

### Password Hashing

The seed data uses Laravel bcrypt hashes. For production:

```tsx
// Install bcryptjs for React Native
npm install bcryptjs

// Hash password
import * as bcrypt from 'bcryptjs';

const plainPassword = 'password123';
const hashedPassword = await bcrypt.hash(plainPassword, 10);
```

### Authentication

Implement authentication checks before database operations:

```tsx
// Example: Verify user credentials
async function login(email: string, password: string) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error('User not found');
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid password');
  
  return user;
}
```

## 📱 React Native Integration

### Using with React Context

```tsx
// DatabaseContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { databaseService } from './sqlite/init';
import { RepositoryFactory } from './sqlite/repositories';

interface IDBContext {
  factory: RepositoryFactory | null;
  loading: boolean;
}

const DBContext = createContext<IDBContext>({ factory: null, loading: true });

export function DatabaseProvider({ children }) {
  const [factory, setFactory] = useState<RepositoryFactory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        await databaseService.initialize();
        const db = databaseService.getDatabase();
        setFactory(new RepositoryFactory(db));
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <DBContext.Provider value={{ factory, loading }}>
      {children}
    </DBContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DBContext);
}
```

## 🧪 Testing

### Reset Database for Testing

```tsx
// Clear all data
await databaseService.clearAll();

// Reset database completely
await databaseService.reset();
```

### Seeding Test Data

```tsx
// After initializing, database is automatically seeded with sample data
await databaseService.initialize(); // Includes seed-data.sql

// Seed data includes:
// - 1 CEO user
// - 2 Manager users
// - 1 Admin user
// - 3 Driver users
// - 3 sample vehicles
// - 3 sample trips with stops
```

## 🔄 Synchronization with Backend

To sync SQLite with your Laravel backend:

```tsx
// Example: Sync trips from API to SQLite
async function syncTripsFromAPI(apiUrl: string) {
  const response = await fetch(`${apiUrl}/api/trips`);
  const trips = await response.json();
  
  const db = databaseService.getDatabase();
  const tripRepo = new TripRepository(db);

  for (const trip of trips) {
    // Check if exists
    const existing = await tripRepo.findByTripNumber(trip.trip_number);
    
    if (existing) {
      await tripRepo.update(existing.id, trip);
    } else {
      await tripRepo.create(trip);
    }
  }
}
```

## 📚 TypeScript Models

All models are fully typed:

```tsx
import {
  User,
  Vehicle,
  Trip,
  TripStop,
  Role,
  Permission,
  TripWithRelations,
  VehicleWithRelations,
  UserWithRelations,
} from './sqlite/models';

// Full type safety
const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  role_id: 4,
  password: 'hash',
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
};
```

## 🐛 Troubleshooting

### Database Not Initializing
- Ensure `expo-sqlite` and `expo-file-system` are installed
- Check device storage permissions
- Clear app cache and reinstall

### Foreign Key Constraint Errors
- SQLite has foreign key constraints enabled
- Delete child records before parent records
- Check that referenced IDs exist

### Performance Issues
- Use indexes (already created in schema.sql)
- Limit query results with LIMIT clause
- Consider pagination for large datasets

## 📞 Support

For issues or questions, refer to:
- [Expo SQLite Documentation](https://docs.expo.dev/modules/expo-sqlite/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Repository Pattern Guide](https://www.martinfowler.com/eaaCatalog/repository.html)

## 📄 License

This database schema is part of the MDA application and follows the same license as the main project.
