# 🚀 SQLite Database Setup Guide for React Native MDA App

Complete step-by-step guide to integrate the SQLite database into your React Native project.

## 📋 Prerequisites

- React Native project (created with Expo or react-native-cli)
- Node.js 16+
- TypeScript (optional but recommended)
- Basic knowledge of React Native and SQLite

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
# Using npm
npm install expo-sqlite expo-file-system

# Using yarn
yarn add expo-sqlite expo-file-system

# Using pnpm
pnpm add expo-sqlite expo-file-system
```

### Step 2: Copy SQLite Files

Copy the entire `sqlite` directory to your project:

```
your-react-native-app/
├── src/
│   ├── sqlite/
│   │   ├── schema.sql
│   │   ├── seed-data.sql
│   │   ├── init.ts
│   │   ├── models.ts
│   │   ├── repositories.ts
│   │   ├── USAGE_EXAMPLES.tsx
│   │   └── README.md
│   ├── App.tsx
│   └── screens/
├── package.json
└── tsconfig.json
```

### Step 3: Update Your App.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { databaseService } from './sqlite/init';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database on app start
    initializeDatabase();
  }, []);

  async function initializeDatabase() {
    try {
      await databaseService.initialize();
      console.log('✓ Database initialized successfully');
      setIsReady(true);
    } catch (err) {
      console.error('✗ Database initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsReady(true); // Still set ready to show error
    }
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Initializing database...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MDA Trip Management App</Text>
        <Text style={styles.subtitle}>Database ready!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  error: {
    color: 'red',
    padding: 16,
    fontSize: 16,
  },
});
```

### Step 4: Create a Database Context (Recommended)

Create `src/context/DatabaseContext.tsx`:

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { databaseService } from '../sqlite/init';
import { RepositoryFactory } from '../sqlite/repositories';

interface DatabaseContextType {
  db: SQLiteDatabase | null;
  factory: RepositoryFactory | null;
  loading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  factory: null,
  loading: true,
  error: null,
});

export function DatabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [factory, setFactory] = useState<RepositoryFactory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  async function initializeDatabase() {
    try {
      await databaseService.initialize();
      const database = databaseService.getDatabase();
      setDb(database);
      setFactory(new RepositoryFactory(database));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DatabaseContext.Provider value={{ db, factory, loading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
}
```

### Step 5: Update App Structure

```tsx
// App.tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { DatabaseProvider } from './context/DatabaseContext';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  return (
    <DatabaseProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <HomeScreen />
      </SafeAreaView>
    </DatabaseProvider>
  );
}
```

## 📲 Creating Your First Screen

Create `src/screens/HomeScreen.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useDatabase } from '../context/DatabaseContext';
import { Trip } from '../sqlite/models';

export function HomeScreen() {
  const { factory, loading, error } = useDatabase();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    if (factory && !loading) {
      loadTrips();
    }
  }, [factory, loading]);

  async function loadTrips() {
    try {
      setLoadingTrips(true);
      const tripRepo = factory!.getTripRepository();
      const allTrips = await tripRepo.findAll();
      setTrips(allTrips);
    } catch (err) {
      console.error('Error loading trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Initializing...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error.message}</Text>
      </View>
    );
  }

  if (loadingTrips) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trips ({trips.length})</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <Text style={styles.tripNumber}>{item.trip_number}</Text>
            <Text>{item.destination_from} → {item.destination_to}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  tripNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
  error: {
    color: 'red',
  },
});
```

## 🗄️ Database Features

### Available Repositories

```tsx
const { factory } = useDatabase();

// Get individual repositories
const userRepo = factory.getUserRepository();
const vehicleRepo = factory.getVehicleRepository();
const tripRepo = factory.getTripRepository();
const stopRepo = factory.getTripStopRepository();
```

### Common Operations

```tsx
// Create
const id = await userRepo.create({ name: 'John', email: 'john@example.com' });

// Read
const user = await userRepo.findById(1);
const allUsers = await userRepo.findAll();

// Update
await userRepo.update(1, { name: 'Jane' });

// Delete
await userRepo.delete(1);

// Query
const drivers = await userRepo.findDrivers();
const trips = await tripRepo.findByStatus('in_progress');
```

## 📊 Seed Data

The database automatically includes:

**Users:**
- 1 CEO (ceo@example.com / password)
- 2 Managers (jovan@example.com, kenan@example.com)
- 1 Admin (admin@example.com)
- 3 Drivers (angelique, nellie, embla @example.com)

**Vehicles:**
- 3 vehicles with registration numbers

**Trips:**
- 3 sample trips with various statuses and trip stops

## 🔐 Security Best Practices

### 1. Password Management

```tsx
// Install bcryptjs
npm install bcryptjs

// Use for password verification
import * as bcrypt from 'bcryptjs';

async function verifyPassword(plainPassword: string, hash: string) {
  return await bcrypt.compare(plainPassword, hash);
}
```

### 2. Authentication Storage

```tsx
// Use secure storage for auth tokens
import * as SecureStore from 'expo-secure-store';

// Store token
await SecureStore.setItemAsync('authToken', token);

// Retrieve token
const token = await SecureStore.getItemAsync('authToken');

// Delete token (logout)
await SecureStore.deleteItemAsync('authToken');
```

### 3. Data Validation

```tsx
// Create validation schema
function validateTrip(trip: Partial<Trip>): string[] {
  const errors: string[] = [];

  if (!trip.trip_number) errors.push('Trip number is required');
  if (!trip.vehicle_id) errors.push('Vehicle is required');
  if (!trip.driver_id) errors.push('Driver is required');

  return errors;
}

// Use before creating
const errors = validateTrip(tripData);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  return;
}
```

## 🧪 Testing

### Unit Tests

```tsx
// tests/repositories.test.ts
import { RepositoryFactory } from '../sqlite/repositories';
import * as SQLite from 'expo-sqlite';

describe('UserRepository', () => {
  let factory: RepositoryFactory;
  let db: SQLite.SQLiteDatabase;

  beforeAll(async () => {
    db = await SQLite.openDatabaseAsync('test.db');
    factory = new RepositoryFactory(db);
  });

  afterAll(async () => {
    await db.closeAsync();
  });

  test('should find user by email', async () => {
    const userRepo = factory.getUserRepository();
    const user = await userRepo.findByEmail('ceo@example.com');
    expect(user).toBeDefined();
    expect(user?.email).toBe('ceo@example.com');
  });
});
```

## 🔄 Syncing with Backend

```tsx
// services/syncService.ts
import axios from 'axios';
import { RepositoryFactory } from '../sqlite/repositories';

export class SyncService {
  constructor(private factory: RepositoryFactory) {}

  async syncTrips(apiUrl: string, token: string) {
    try {
      const response = await axios.get(`${apiUrl}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tripRepo = this.factory.getTripRepository();
      const trips = response.data.data;

      for (const trip of trips) {
        const existing = await tripRepo.findByTripNumber(trip.trip_number);
        if (existing) {
          await tripRepo.update(existing.id, trip);
        } else {
          await tripRepo.create(trip);
        }
      }

      console.log('Trips synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
}
```

## 📱 Build and Run

```bash
# Development
npm run start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 🐛 Troubleshooting

### Issue: "Database not initialized"
**Solution:** Ensure `databaseService.initialize()` is called before using repositories

### Issue: Foreign key constraint error
**Solution:** Delete child records before parent records, or disable cascade constraints temporarily

### Issue: App crashes on startup
**Solution:** Check device storage permissions and clear app cache

## 📚 Additional Resources

- [Expo SQLite Docs](https://docs.expo.dev/modules/expo-sqlite/)
- [SQLite Docs](https://www.sqlite.org/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Copy SQLite files to your project
3. ✅ Set up DatabaseProvider in your app
4. ✅ Create screens that use the database
5. ✅ Implement authentication
6. ✅ Add syncing with backend API
7. ✅ Test thoroughly
8. ✅ Deploy to production

## 💡 Tips

- Use the Repository pattern for cleaner code organization
- Always use TypeScript types for better IDE support
- Test database operations thoroughly before production
- Consider implementing backup/restore functionality
- Monitor database file size for large datasets
- Use proper indexing for frequently queried fields

---

**Ready to build your React Native app?** Start by following Step 1-5 in the Installation Steps section above!
