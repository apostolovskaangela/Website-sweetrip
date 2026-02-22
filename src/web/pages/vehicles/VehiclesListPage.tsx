import React, { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { useVehiclesQuery } from '@/src/hooks/queries';
import { useAuth } from '@/src/hooks/useAuth';
import { RoleFactory } from '@/src/roles';

export function VehiclesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleHandler = useMemo(() => (user ? RoleFactory.createFromUser({ roles: user.roles }) : null), [user]);
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;

  const query = useVehiclesQuery();

  if (!canViewVehicles) {
    return (
      <Box sx={{ maxWidth: 1100 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.25 }}>
          Vehicles
        </Typography>
        <Typography color="text.secondary">Vehicles are not available for your role.</Typography>
      </Box>
    );
  }

  if (query.isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const vehicles = query.data ?? [];

  return (
    <Box sx={{ maxWidth: 1180 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'start', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Vehicles
          </Typography>
          <Typography color="text.secondary">Monitor your fleet status and performance</Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/app/vehicles/new')} startIcon={<AddIcon />}>
          New Vehicle
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gap: 2 }}>
        {vehicles.map((v: any) => (
          <Paper
            key={v.id}
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
              <DirectionsCarIcon sx={{ mt: 0.25, opacity: 0.8 }} />
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 900 }}>
                    Registration Number {v.registration_number}
                  </Typography>
                  <Chip
                    size="small"
                    color={v.is_active ? 'success' : 'default'}
                    label={v.is_active ? 'Active' : 'Inactive'}
                    variant={v.is_active ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 800, borderRadius: 999 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {v.notes ? String(v.notes) : '—'}
                </Typography>
              </Box>
            </Box>

            <IconButton
              component={RouterLink}
              to={`/app/vehicles/${v.id}`}
              sx={{
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 2,
              }}
              aria-label="View vehicle"
            >
              <VisibilityOutlinedIcon />
            </IconButton>
          </Paper>
        ))}

        {vehicles.length === 0 && <Typography color="text.secondary">No vehicles found.</Typography>}
      </Box>
    </Box>
  );
}

