import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

import { QueryProvider } from '@/src/lib/QueryProvider';
import { AuthProvider } from '@/src/context/Auth';
import Offline from '@/src/services/offline';
import * as dataService from '@/src/lib/sqlite/dataService';

import { WebThemeProvider } from './theme/WebThemeProvider';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layout/AppLayout';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TripsListPage } from './pages/trips/TripsListPage';
import { TripCreatePage } from './pages/trips/TripCreatePage';
import { TripDetailsPage } from './pages/trips/TripDetailsPage';
import { TripEditPage } from './pages/trips/TripEditPage';
import { VehiclesListPage } from './pages/vehicles/VehiclesListPage';
import { VehicleCreatePage } from './pages/vehicles/VehicleCreatePage';
import { VehicleDetailsPage } from './pages/vehicles/VehicleDetailsPage';
import { VehicleEditPage } from './pages/vehicles/VehicleEditPage';
import { OfflineQueuePage } from './pages/offline/OfflineQueuePage';
import { AdminPage } from './pages/admin/AdminPage';

function FullscreenLoader() {
  return (
    <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

export function WebApp() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    dataService
      .initializeLocalDatabase()
      .catch((e) => {
        // keep app usable; APIs may still work with empty/local state
        console.error('Failed to initialize local database', e);
      })
      .finally(() => {
        if (mounted) setDbInitialized(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!dbInitialized) return;

    Offline.startBackgroundSync();
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        Offline.processQueue().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
      Offline.stopBackgroundSync();
    };
  }, [dbInitialized]);

  const app = useMemo(() => {
    if (!dbInitialized) return <FullscreenLoader />;

    return (
      <WebThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                <Route path="trips" element={<TripsListPage />} />
                <Route path="trips/new" element={<TripCreatePage />} />
                <Route path="trips/:id" element={<TripDetailsPage />} />
                <Route path="trips/:id/edit" element={<TripEditPage />} />

                <Route path="vehicles" element={<VehiclesListPage />} />
                <Route path="vehicles/new" element={<VehicleCreatePage />} />
                <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
                <Route path="vehicles/:id/edit" element={<VehicleEditPage />} />

                <Route path="offline-queue" element={<OfflineQueuePage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </QueryProvider>
      </WebThemeProvider>
    );
  }, [dbInitialized]);

  return app;
}

