import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Divider, Typography } from '@mui/material';

import { vehiclesApi } from '@/src/services/api';
import { useAuth } from '@/src/hooks/useAuth';
import { RoleFactory } from '@/src/roles';

export function VehicleDetailsPage() {
  const { id } = useParams();
  const vehicleId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleHandler = useMemo(() => (user ? RoleFactory.createFromUser({ roles: user.roles }) : null), [user]);
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;

  const [vehicle, setVehicle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (!Number.isFinite(vehicleId)) return;
    setLoading(true);
    vehiclesApi
      .get(vehicleId)
      .then((v) => {
        if (!mounted) return;
        setVehicle(v);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load vehicle');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [vehicleId]);

  if (!canViewVehicles) {
    return <Alert severity="warning">Vehicle details are not available for your role.</Alert>;
  }

  if (!Number.isFinite(vehicleId)) return <Alert severity="error">Invalid vehicle id</Alert>;

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!vehicle) return <Alert severity="error">{error ?? 'Vehicle not found'}</Alert>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {vehicle.registration_number}
          </Typography>
          <Typography color={vehicle.is_active ? 'success.main' : 'text.secondary'}>
            {vehicle.is_active ? 'Active' : 'Inactive'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/app/vehicles')}>
            Back
          </Button>
          <Button variant="contained" onClick={() => navigate(`/app/vehicles/${vehicleId}/edit`)}>
            Edit
          </Button>
        </Box>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography color={vehicle.notes ? 'text.primary' : 'text.secondary'}>
            {vehicle.notes || 'No notes'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

