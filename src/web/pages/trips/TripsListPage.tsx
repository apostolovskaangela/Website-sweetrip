import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RouteIcon from '@mui/icons-material/Route';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { useTripsQuery, useUserPermissionsQuery } from '@/src/hooks/queries';
import { StatusChip } from '@/src/web/components/StatusChip';

export function TripsListPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const tripsQuery = useTripsQuery();
  const permissionsQuery = useUserPermissionsQuery();

  const flash = location?.state?.flash as { type?: 'success' | 'info' | 'error'; message?: string } | undefined;

  React.useEffect(() => {
    if (!flash?.message) return;
    const t = window.setTimeout(() => {
      // Clear location.state
      navigate('.', { replace: true, state: null });
    }, 3500);
    return () => window.clearTimeout(t);
  }, [flash?.message, navigate]);

  const loading = tripsQuery.isLoading || permissionsQuery.isLoading;
  const canCreate = permissionsQuery.data?.canCreateTrip ?? false;
  const trips = tripsQuery.data ?? [];
  const error = tripsQuery.error || permissionsQuery.error;

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1180 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'start', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Trips
          </Typography>
          <Typography color="text.secondary">Manage and track all your trips</Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" onClick={() => navigate('/app/trips/new')} startIcon={<AddIcon />}>
            New Trip
          </Button>
        )}
      </Box>

      {!!error && (
        <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
          <Typography color="error">Failed to load trips. Please try again.</Typography>
        </Paper>
      )}

      {!!flash?.message && (
        <Alert severity={flash.type ?? 'info'} sx={{ mb: 2 }}>
          {flash.message}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 2 }}>
        {trips.map((t: any) => {
          const tripId = Number(t?.id);
          const canOpen = Number.isFinite(tripId) && tripId !== 0;
          const to = canOpen ? `/app/trips/${tripId}` : undefined;
          return (
          <Paper
            key={String(tripId || t?.trip_number || Math.random())}
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, minWidth: 0 }}>
              <RouteIcon sx={{ mt: 0.25, opacity: 0.8 }} />
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 900 }}>
                    {t.destination_from} → {t.destination_to}
                  </Typography>
                  <StatusChip status={t.status} label={t.status_label} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Trip #{t.trip_number} • {t.trip_date} • Vehicle: {t.vehicle?.registration_number ?? 'N/A'}
                </Typography>
              </Box>
            </Box>

            <IconButton
              component={canOpen ? RouterLink : 'button'}
              to={to as any}
              disabled={!canOpen}
              sx={{
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 2,
              }}
              aria-label="View trip"
            >
              <VisibilityOutlinedIcon />
            </IconButton>
          </Paper>
          );
        })}
        {trips.length === 0 && <Typography color="text.secondary">No trips found.</Typography>}
      </Box>
    </Box>
  );
}

