# SweetTrip (Sweetrip) — Fleet Management (React Native / Expo)

SweetTrip is a fleet management mobile app where managers create and assign trips to drivers, drivers can view and update their trips, and all authorized users can track live locations.

## Features

- **Role-aware navigation**: menu items adapt to the logged-in user’s role (see `src/roles/` + `src/hooks/useMenuItems.ts`)
- **Trips & Vehicles CRUD**: list/create/edit/details flows with server-state caching (React Query)
- **Live tracking**:
  - Drivers can share location updates (foreground tracking)
  - Managers can view driver positions on the map (Live Tracking screen)
- **Offline support**:
  - Mutations can be queued to local storage and synced later (see `src/services/offline.ts`)
  - Local SQLite DB is initialized on first run (see `src/services/db/`)
- **Real-time scaffolding**:
  - WebSocket service exists (`src/services/realtime/socket.ts`)
  - Driver-side WS tracking sender exists (`src/services/location/driverTracking.ts`)
- **Accessibility**:
  - Key entry points and navigation buttons include labels/roles and keyboard-friendly flow
- **Dark/Light theme**:
  - React Native Paper MD3 theme is provided globally (see `src/theme/paperTheme.ts`)
   
## Tech stack

- **Expo** + **React Native**
- **React Navigation** (stack + drawer)
- **React Query (@tanstack/react-query)** for server-state caching, retries, and invalidation
- **React Native Paper** for UI components with MD3 theming
- **Axios** for HTTP
- **expo-location** for location permissions + tracking
- **expo-sqlite** for local persistence

## Project structure (high-level)

- `app/App.tsx`: app root (providers, offline sync bootstrap, SQLite init)
- `src/context/Auth/`: Auth state + actions (Context API + repository pattern)
- `src/services/api/`: API clients (trips/vehicles/users/auth)
- `src/hooks/queries/`: React Query hooks (queries + optimistic mutation patterns)
- `src/services/offline.ts`: offline queue + background sync
- `src/services/location/`: location tracking utilities
- `src/services/realtime/`: WebSocket client
- `src/screens/`: screen modules (UI + `logic.tsx` + `styles.ts`)
- `docs/`: API + performance notes

## Setup

### 1) Install dependencies

```bash
npm install
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

### 3) (Optional) Configure WebSocket URL

The WebSocket URL is currently hardcoded in `src/services/realtime/socket.ts`. If your backend WS host/port differs, update it there.

### 4) Start the app

```bash
npx expo start
```

## Testing

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

Integration test config (templates included):

```bash
npm run test:integration
```

If `npm install` fails with peer dependency errors, run:

```bash
npm install --legacy-peer-deps
```

## Login credentials

- **Managers**: 
  - Email: jovan@example.com Password:123123123
  - Email: kenan@example.com Password:123123123
- **Drivers**:
  - Email: angelique@example.com Password:password
  - Email: nellie@example.com Password:password
- **CEO**:
  - Email: ceo@example.com Password:password
- **Admin**:
  - Email: admin@example.com Password:password


## Docs

- API reference: `docs/API.md`
- Performance notes: `docs/PERFORMANCE.md`
- E2E scaffolding: `e2e/README.md`

