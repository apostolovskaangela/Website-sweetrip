# SQLite Database - Quick Reference

## 🚀 Quick Start

```tsx
// 1. Initialize
import { databaseService } from './sqlite/init';
await databaseService.initialize();

// 2. Get database and factory
const db = databaseService.getDatabase();
const factory = new RepositoryFactory(db);

// 3. Use repositories
const userRepo = factory.getUserRepository();
const tripRepo = factory.getTripRepository();
const vehicleRepo = factory.getVehicleRepository();
const stopRepo = factory.getTripStopRepository();
```

## 👥 User Operations

```tsx
// Find operations
await userRepo.findAll()                    // All users
await userRepo.findById(1)                  // By ID
await userRepo.findByEmail('user@ex.com')   // By email
await userRepo.findByRoleId(4)              // By role
await userRepo.findDrivers()                // All drivers (role_id=4)
await userRepo.findManagers()               // All managers (role_id=2)
await userRepo.findCeo()                    // CEO (role_id=1)
await userRepo.findDriversByManagerId(2)    // Manager's drivers
await userRepo.findByManagerId(2)           // Manager's subordinates
await userRepo.findWithRelations(1)         // With manager, drivers, trips

// Create
await userRepo.create({
  name: 'John', 
  email: 'john@example.com',
  role_id: 4,
  password: 'hash',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

// Update
await userRepo.update(1, { name: 'Jane' })

// Delete
await userRepo.delete(1)
await userRepo.deleteAll()
await userRepo.count()
```

## 🚗 Vehicle Operations

```tsx
// Find operations
await vehicleRepo.findAll()                         // All vehicles
await vehicleRepo.findById(1)                       // By ID
await vehicleRepo.findActive()                      // Active only
await vehicleRepo.findByRegistrationNumber('ABC')   // By registration
await vehicleRepo.findByManagerId(2)                // Manager's vehicles
await vehicleRepo.findWithRelations(1)              // With manager and trips

// Create
await vehicleRepo.create({
  registration_number: 'ABC-123',
  manager_id: 2,
  is_active: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

// Update
await vehicleRepo.update(1, { is_active: 0 })

// Delete
await vehicleRepo.delete(1)
await vehicleRepo.deleteAll()
await vehicleRepo.count()
```

## ✈️ Trip Operations

```tsx
// Find operations
await tripRepo.findAll()                         // All trips
await tripRepo.findById(1)                       // By ID
await tripRepo.findByTripNumber('TRIP-001')      // By trip number
await tripRepo.findByDriverId(5)                 // Driver's trips
await tripRepo.findByVehicleId(1)                // Vehicle's trips
await tripRepo.findByStatus('in_progress')       // By status
await tripRepo.findByDate('2026-02-01')          // By date
await tripRepo.findByDateRange('2026-02-01', '2026-02-28') // Date range
await tripRepo.getActiveTripsByManager(2)        // Manager's active trips
await tripRepo.findWithRelations(1)              // With driver, vehicle, stops

// Create
await tripRepo.create({
  trip_number: 'TRIP-001',
  vehicle_id: 1,
  driver_id: 5,
  destination_from: 'City A',
  destination_to: 'City B',
  status: 'not_started',
  trip_date: '2026-02-01',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

// Update
await tripRepo.update(1, { status: 'in_progress' })
await tripRepo.updateStatus(1, 'completed')

// Delete
await tripRepo.delete(1)
await tripRepo.deleteAll()
await tripRepo.count()
```

## 🛑 Trip Stop Operations

```tsx
// Find operations
await stopRepo.findAll()                      // All stops
await stopRepo.findById(1)                    // By ID
await stopRepo.findByTripId(1)                // Trip's stops
await stopRepo.findByTripIdAndOrder(1, 1)     // Specific stop order

// Create
await stopRepo.create({
  trip_id: 1,
  destination: 'Intermediate City',
  stop_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

// Update
await stopRepo.update(1, { notes: 'New notes' })

// Delete
await stopRepo.delete(1)
await stopRepo.deleteByTripId(1)
await stopRepo.deleteAll()
await stopRepo.count()

// Utility
await stopRepo.getNextStopOrder(1)  // Get next order number for trip
```

## 📊 Statuses

```
Trip Status Values:
- 'not_started'
- 'in_progress'
- 'completed'
- 'cancelled'
```

## 👤 Role IDs

```
1 = CEO
2 = Manager
3 = Admin
4 = Driver
```

## 🔑 Key Seed Data

```
Users:
- ID 1: CEO (ceo@example.com)
- ID 2: Manager (jovan@example.com)
- ID 3: Manager (kenan@example.com)
- ID 4: Admin (admin@example.com)
- ID 5: Driver (angelique@example.com)
- ID 6: Driver (nellie@example.com)
- ID 7: Driver (embla@example.com)

Vehicles:
- ID 1: ABC-123
- ID 2: XYZ-789
- ID 3: MNO-456

Trips:
- ID 1: TRIP-001
- ID 2: TRIP-002
- ID 3: TRIP-003
```

## 🛠️ Database Management

```tsx
// Initialize
await databaseService.initialize()

// Get database
const db = databaseService.getDatabase()

// Close
await databaseService.close()

// Clear all data
await databaseService.clearAll()

// Reset completely
await databaseService.reset()
```

## 📝 Common Patterns

### Get trip with all details
```tsx
const trip = await tripRepo.findWithRelations(1);
// Returns: Trip + driver + vehicle + stops + creator
```

### Get manager summary
```tsx
const manager = await userRepo.findWithRelations(2);
// Returns: User + manager + drivers + assigned trips
```

### Get vehicle with trips
```tsx
const vehicle = await vehicleRepo.findWithRelations(1);
// Returns: Vehicle + manager + trips
```

### Create trip with stops
```tsx
const tripId = await tripRepo.create({...});
await stopRepo.create({ trip_id: tripId, destination: 'Stop 1', stop_order: 1 });
await stopRepo.create({ trip_id: tripId, destination: 'Stop 2', stop_order: 2 });
```

### Update trip status
```tsx
await tripRepo.updateStatus(1, 'in_progress');
```

### Get statistics
```tsx
const totalTrips = await tripRepo.count();
const completedTrips = (await tripRepo.findByStatus('completed')).length;
const inProgressTrips = (await tripRepo.findByStatus('in_progress')).length;
```

## ⚙️ TypeScript Types

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
```

## 🧪 Testing

```tsx
// Clear data
await databaseService.clearAll();

// Reset database
await databaseService.reset();
```

## 📚 Full Documentation

- `README.md` - Comprehensive guide
- `SETUP_GUIDE.md` - Step-by-step setup
- `USAGE_EXAMPLES.tsx` - Code examples
- `models.ts` - TypeScript interfaces
- `repositories.ts` - Repository implementation
- `schema.sql` - Database schema
- `seed-data.sql` - Initial data

---

**Version:** 1.0.0  
**Last Updated:** February 1, 2026  
**SQLite:** 3.45.0+
