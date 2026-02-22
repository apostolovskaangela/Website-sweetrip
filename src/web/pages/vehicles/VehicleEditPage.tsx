import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';

import { vehiclesApi } from '@/src/services/api';
import { useAuth } from '@/src/hooks/useAuth';
import { RoleFactory } from '@/src/roles';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/queryKeys';

export function VehicleEditPage() {
  const { id } = useParams();
  const vehicleId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleHandler = useMemo(() => (user ? RoleFactory.createFromUser({ roles: user.roles }) : null), [user]);
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;
  const qc = useQueryClient();

  const [registration, setRegistration] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    if (!Number.isFinite(vehicleId)) return;
    setLoading(true);
    vehiclesApi
      .get(vehicleId)
      .then((v: any) => {
        if (!mounted) return;
        setRegistration(v.registration_number ?? '');
        setNotes(v.notes ?? '');
        setIsActive(Boolean(v.is_active === 1 || v.is_active === true));
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

  if (!canViewVehicles) return <Alert severity="warning">Vehicles are not available for your role.</Alert>;
  if (!Number.isFinite(vehicleId)) return <Alert severity="error">Invalid vehicle id</Alert>;
  if (loading) return <Typography color="text.secondary">Loading…</Typography>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await vehiclesApi.update(vehicleId, {
        registration_number: registration,
        notes: notes || undefined,
        is_active: isActive ? 1 : 0,
      });
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.list() });
      navigate(`/app/vehicles/${vehicleId}`, { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Edit vehicle
          </Typography>
          <Typography color="text.secondary">Update vehicle details and save changes.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate(`/app/vehicles/${vehicleId}`)}>
          Cancel
        </Button>
      </Box>

      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Registration number" value={registration} onChange={(e) => setRegistration(e.target.value)} required />
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={4} />
            <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Active" />
            <Button type="submit" variant="contained" size="large" disabled={saving}>
              {saving ? 'Updating…' : 'Update'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

