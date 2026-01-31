import { QueryClient } from "@tanstack/react-query";

/**
 * Default stale and cache times for server state.
 * - staleTime: data considered fresh; no refetch
 * - gcTime (cacheTime): unused cache kept in memory
 */
const defaultStaleTime = 60 * 1000; // 1 minute
const defaultGcTime = 5 * 60 * 1000; // 5 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: defaultStaleTime,
      gcTime: defaultGcTime,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
