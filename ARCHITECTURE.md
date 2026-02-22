# Architecture Overview - SQLite Local Database

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native App                            │
│  (Screens, Components, Navigation)                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│              React Query Layer                                   │
│  (hooks/queries/*.ts - useTripQuery, useVehiclesQuery, etc)     │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│           API Service Layer                                      │
│  (src/services/api/*.ts)                                         │
│  ├─ trips.ts      ← Uses dataService                            │
│  ├─ vehicles.ts   ← Uses dataService                            │
│  ├─ users.ts      ← Uses dataService                            │
│  ├─ auth.ts       ← Uses dataService                            │
│  └─ dashboard.ts  ← Uses dataService                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│        Local Data Service Layer                                  │
│  (src/lib/sqlite/dataService.ts)                                │
│  - In-memory CRUD operations                                     │
│  - Automatic ID generation                                       │
│  - Relationship management                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│           Data Models                                            │
│  (src/lib/sqlite/models.ts)                                     │
│  - User, Vehicle, Trip, TripStop, Role interfaces              │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│         In-Memory Data Store                                     │
│  Database = {                                                    │
│    users: [...],                                                 │
│    vehicles: [...],                                              │
│    trips: [...],                                                 │
│    trip_stops: [...],                                            │
│    roles: [...]                                                  │
│  }                                                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│        public/api/db.json                                        │
│  (Seed data loaded on app startup)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Fetching Trips

```
User navigates to Trips screen
    ↓
useTripsQuery hook executes
    ↓
React Query calls tripsApi.list()
    ↓
tripsApi calls dataService.getAllTrips()
    ↓
dataService returns trips from memory
    ↓
React Query caches and displays data
    ↓
User sees trips on screen
```

## Data Flow Example: Creating a Trip

```
User fills trip form and submits
    ↓
useTripMutations.createTrip() called
    ↓
tripsApi.create(tripData) executed
    ↓
dataService.createTrip(tripData) called
    ↓
New trip added to memory with auto ID
    ↓
Related trip stops created
    ↓
React Query invalidates cache
    ↓
UI refreshes with new trip
```

## Component Responsibilities

### App.tsx
```
Responsibilities:
- Initialize database on startup
- Load db.json into memory
- Setup error handling
- Manage app lifecycle
```

### src/lib/sqlite/dataService.ts
```
Responsibilities:
- CRUD operations for all entities
- In-memory data management
- ID generation
- Relationship loading
- Query filtering and sorting
```

### src/services/api/
```
Responsibilities:
- Provide API-compatible interface
- Transform data for frontend
- Handle pagination
- Maintain backward compatibility
- Wrap dataService calls
```

### React Query Hooks
```
Responsibilities:
- Data fetching orchestration
- Caching and invalidation
- State management
- Loading/error states
- Mutation handling
```

## Data Model Relationships

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id              │
│ name            │
│ email           │
│ role_id    ─────┼──────────────┐
│ manager_id ─┐   │              │
└─────────────┼───┘              │
              │                  │
              │           ┌──────▼────────┐
              │           │     Role      │
              │           ├───────────────┤
              │           │ id            │
              │           │ name          │
              │           │ guard_name    │
              │           └───────────────┘
              │
        ┌─────┴──────────────┐
        │                    │
        │ (manager)          │ (driver)
        │                    │
   ┌────▼──────────┐   ┌────▼──────────┐
   │   Vehicle     │   │     Trip      │
   ├───────────────┤   ├───────────────┤
   │ id            │   │ id            │
   │ registration_number   │ trip_number       │
   │ manager_id    │   │ vehicle_id    │
   │ is_active     │   │ driver_id     │
   └────┬──────────┘   │ status        │
        │              │ trip_date     │
        │              │ created_by    │
        │              └────┬──────────┘
        │                   │
        │              ┌────▼───────────┐
        │              │   TripStop    │
        │              ├───────────────┤
        │              │ id            │
        │              │ trip_id       │
        │              │ destination   │
        │              │ stop_order    │
        │              └───────────────┘
        │
    (joined)
        │
    ┌───┴─────┐
    │ Vehicle │──> ┌────────────────┐
    │ + Trips │    │ Trip[]         │
    │ + Manager   │ (all trips for  │
    └───────────┘  │  this vehicle) │
                   └────────────────┘
```

## State Management

### Application State
```
Database State (in-memory)
├── Users
│   ├── ID mapping
│   ├── Email lookup
│   └── Role associations
├── Vehicles
│   ├── ID mapping
│   ├── Manager associations
│   └── Active status
├── Trips
│   ├── ID mapping
│   ├── Status tracking
│   ├── Driver assignments
│   └── Vehicle assignments
├── Trip Stops
│   ├── ID mapping
│   ├── Trip associations
│   └── Order tracking
└── Roles
    ├── ID mapping
    └── Name lookup

React Query Cache
├── Query results
├── Stale times
├── Invalidation rules
└── Mutations queue

Local Storage
├── AUTH_TOKEN
└── USER_DATA
```

## Operations Flow

### Read Operations
```
1. Request comes from component/hook
2. API layer validates request
3. DataService queries in-memory data
4. Results returned immediately
5. React Query caches results
```

### Write Operations
```
1. Mutation triggered from component
2. Optimistic update (React Query)
3. DataService updates in-memory data
4. ID auto-generated if new record
5. Query cache invalidated
6. Component re-renders with new data
```

### Error Handling
```
Component
    ↓
API Layer
    ↓ (catches errors)
    ↓
React Query
    ↓ (sets error state)
    ↓
Component
    ↓ (displays error message)
```

## Performance Characteristics

```
Operation          | Time    | Notes
─────────────────────────────────────────────────
App startup        | <100ms  | Load db.json, parse
Query (findAll)    | ~1ms    | In-memory filter
Query (findById)   | ~0.5ms  | Object lookup
Create             | ~0.5ms  | Push to array
Update             | ~0.5ms  | Object merge
Delete             | ~1ms    | Splice from array
Sort/Filter        | <5ms    | Array operations
─────────────────────────────────────────────────
```

## Scalability Notes

### Current Limitations
- In-memory storage (loses on reload)
- No persistence layer
- Single-threaded operations
- No indexing optimization needed for seed data

### For Production Scale
```
Recommended changes:
1. Switch to expo-sqlite
2. Add database schema
3. Implement migrations
4. Add query indexing
5. Implement pagination
6. Add background sync
7. Implement compression
8. Add backup/restore
```

## Integration Points

### With Existing Code
- React Query hooks: ✅ Transparent
- API types: ✅ Compatible
- Authentication flow: ✅ Enhanced
- Navigation: ✅ No changes
- UI Components: ✅ No changes
- Utils/Helpers: ✅ No changes

### Available for Extension
- Location tracking hook
- Real-time subscriptions
- Offline queue sync
- Analytics events
- Error tracking
- Custom queries

## Security Notes

### Current Implementation
- No authentication validation (dev mode)
- No encryption (in-memory)
- No access control (all data accessible)
- No audit logging

### Production Recommendations
- Implement bcrypt password verification
- Add role-based access control (RBAC)
- Encrypt sensitive data
- Add audit logging
- Implement rate limiting
- Add request validation

---

## Architecture Benefits

✅ **Simplicity**
- Single in-memory store
- No network complexity
- Easy to understand and debug

✅ **Speed**
- No network latency
- Immediate responses
- Instant UI updates

✅ **Development**
- No backend needed
- Fast iteration
- Easy testing

✅ **Offline First**
- Works without connectivity
- Great for development
- Testing offline scenarios

---

This architecture is optimized for development and testing. For production, implement persistence layer as documented.
