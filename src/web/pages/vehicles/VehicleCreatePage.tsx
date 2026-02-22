import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';

import { vehiclesApi } from '@/src/services/api';
import { useAuth } from '@/src/hooks/useAuth';
import { RoleFactory } from '@/src/roles';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/queryKeys';

export function VehicleCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleHandler = useMemo(() => (user ? RoleFactory.createFromUser({ roles: user.roles }) : null), [user]);
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;
  const qc = useQueryClient();

  const [registration, setRegistration] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  if (!canViewVehicles) return <Alert severity="warning">Vehicles are not available for your role.</Alert>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await vehiclesApi.create({
        registration_number: registration,
        notes: notes || undefined,
        is_active: isActive ? 1 : 0,
        manager_id: user?.id,
      });
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.list() });
      navigate('/app/vehicles', { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Create vehicle
          </Typography>
          <Typography color="text.secondary">Add a vehicle to your fleet.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/app/vehicles')}>
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
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

