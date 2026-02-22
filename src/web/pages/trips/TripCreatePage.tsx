import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { tripsApi } from '@/src/services/api';
import { useTripMutations } from '@/src/hooks/queries';

type FormState = {
  trip_number: string;
  destination_from: string;
  destination_to: string;
  a_code: string;
  mileage: string;
  trip_date: string;
  vehicle_id: number;
  driver_id: number;
  driver_description: string;
  admin_description: string;
  invoice_number: string;
  amount: string;
};

export function TripCreatePage() {
  const navigate = useNavigate();
  const { createTrip, createTripMutation } = useTripMutations();

  const [drivers, setDrivers] = React.useState<{ id: number; name: string; email: string }[]>([]);
  const [vehicles, setVehicles] = React.useState<{ id: number; registration_number: string; is_active: boolean }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<FormState>(() => ({
    trip_number: '',
    destination_from: '',
    destination_to: '',
    a_code: '',
    mileage: '',
    trip_date: new Date().toISOString().slice(0, 10),
    vehicle_id: 0,
    driver_id: 0,
    driver_description: '',
    admin_description: '',
    invoice_number: '',
    amount: '',
  }));

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    tripsApi
      .getCreateData()
      .then((data) => {
        if (!mounted) return;
        setDrivers(data.drivers);
        setVehicles(data.vehicles);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load create data');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!form.vehicle_id || !form.driver_id) {
        setError('Driver and vehicle are required');
        return;
      }
      await createTrip({
        trip_number: form.trip_number,
        destination_from: form.destination_from,
        destination_to: form.destination_to,
        a_code: form.a_code || undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        trip_date: form.trip_date,
        vehicle_id: Number(form.vehicle_id),
        driver_id: Number(form.driver_id),
        driver_description: form.driver_description || undefined,
        admin_description: form.admin_description || undefined,
        invoice_number: form.invoice_number || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        status: 'not_started',
      });
      navigate('/app/trips', { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create trip');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Create trip
          </Typography>
          <Typography color="text.secondary">Fill in the details below to dispatch a trip.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/app/trips')}>
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
            <TextField label="Trip number" value={form.trip_number} onChange={(e) => setField('trip_number', e.target.value)} required />
            <TextField label="From" value={form.destination_from} onChange={(e) => setField('destination_from', e.target.value)} required />
            <TextField label="To" value={form.destination_to} onChange={(e) => setField('destination_to', e.target.value)} required />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="A Code" value={form.a_code} onChange={(e) => setField('a_code', e.target.value)} />
              <TextField
                label="Mileage (km)"
                value={form.mileage}
                onChange={(e) => setField('mileage', e.target.value)}
                inputMode="numeric"
              />
            </Box>

            <TextField
              label="Trip date"
              type="date"
              value={form.trip_date}
              onChange={(e) => setField('trip_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />

            <Divider />

            <TextField
              select
              label="Vehicle"
              value={form.vehicle_id}
              onChange={(e) => setField('vehicle_id', Number(e.target.value))}
              required
            >
              <MenuItem value={0}>Select vehicle</MenuItem>
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.registration_number} {v.is_active ? '' : '(inactive)'}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Driver"
              value={form.driver_id}
              onChange={(e) => setField('driver_id', Number(e.target.value))}
              required
            >
              <MenuItem value={0}>Select driver</MenuItem>
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Driver instructions / notes"
              value={form.driver_description}
              onChange={(e) => setField('driver_description', e.target.value)}
              multiline
              minRows={3}
            />
            <TextField
              label="Internal admin / manager notes"
              value={form.admin_description}
              onChange={(e) => setField('admin_description', e.target.value)}
              multiline
              minRows={3}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Invoice number"
                value={form.invoice_number}
                onChange={(e) => setField('invoice_number', e.target.value)}
              />
              <TextField
                label="Amount"
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
                inputMode="decimal"
              />
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={createTripMutation.isPending}>
              {createTripMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

