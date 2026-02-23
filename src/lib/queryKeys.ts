/**
 * Centralized query key factory for TanStack Query.
 * Ensures consistent keys and easy invalidation.
 */

export const queryKeys = {
  all: ["app"] as const,

  trips: {
    all: ["trips"] as const,
    lists: () => [...queryKeys.trips.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.trips.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.trips.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.trips.details(), id] as const,
    createData: () => [...queryKeys.trips.all, "createData"] as const,
  },

  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: () => [...queryKeys.users.lists()] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },

  dashboard: {
    all: ["dashboard"] as const,
    main: () => [...queryKeys.dashboard.all, "main"] as const,
  },

  vehicles: {
    all: ["vehicles"] as const,
    lists: () => [...queryKeys.vehicles.all, "list"] as const,
    list: () => [...queryKeys.vehicles.lists()] as const,
    details: () => [...queryKeys.vehicles.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.vehicles.details(), id] as const,
  },

  user: {
    all: ["user"] as const,
    permissions: () => [...queryKeys.user.all, "permissions"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
  },
} as const;
