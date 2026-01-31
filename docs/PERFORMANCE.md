# Performance & Bundle

## Virtualization

- All long lists use `FlatList` with shared config from `src/lib/listConfig.ts`:
  - `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews` (Android).
- Use `getFixedItemLayout(itemHeight)` when list items have fixed height for best scroll perf.

## Images

- CMR and remote images use `expo-image` with:
  - `cachePolicy="memory-disk"` for caching.
  - `placeholder` (blurhash) and `transition` for perceived performance.
- Modal image only mounts when modal is visible (lazy).

## Memory

- `useLiveDrivers`: location subscription and interval are stored in refs and cleared on unmount.
- All `useEffect` cleanups: intervals, listeners, and subscriptions are removed in the return function.

## Re-renders

- List item components are wrapped in `React.memo` (TripCard, VehicleCard, RecentTripCard, RecentVehicleCard, PendingItemCard).
- List `keyExtractor`, `renderItem`, and nav handlers use `useCallback` with correct deps.
- Auth context value is memoized with `useMemo`.

## Bundle size

- Prefer named imports from specific modules (e.g. `import { useTripsQuery } from '@/src/hooks/queries'`) so bundler can tree-shake.
- Heavy screens can be lazy-loaded with `React.lazy` + `Suspense` if the Metro/babel setup supports it.
- To analyze bundle: `npx react-native-bundle-visualizer` or Expo’s build output.

## Monitoring

- `src/utils/performance.ts`: `mark()`, `measure()`, `measureAsync()` for timing; `useRenderCount(label)` in **DEV** to log re-renders.
