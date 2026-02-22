import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Divider, TextField, Typography } from '@mui/material';

import { tripsApi, type Trip } from '@/src/services/api/trips';
import { useTripMutations } from '@/src/hooks/queries';

type FormState = {
  trip_number: string;
  a_code: string;
  destination_from: string;
  destination_to: string;
  mileage: string;
  driver_description: string;
  admin_description: string;
  invoice_number: string;
  amount: string;
};

export function TripEditPage() {
  const { id } = useParams();
  const tripId = Number(id);
  const navigate = useNavigate();
  const { updateTrip, updateTripMutation } = useTripMutations();

  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (!Number.isFinite(tripId)) return;
    setLoading(true);
    tripsApi
      .get(tripId)
      .then((t) => {
        if (!mounted) return;
        setTrip(t);
        setForm({
          trip_number: t.trip_number ?? '',
          a_code: t.a_code ?? '',
          destination_from: t.destination_from ?? '',
          destination_to: t.destination_to ?? '',
          mileage: t.mileage != null ? String(t.mileage) : '',
          driver_description: t.driver_description ?? '',
          admin_description: t.admin_description ?? '',
          invoice_number: t.invoice_number ?? '',
          amount: t.amount != null ? String(t.amount) : '',
        });
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load trip');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tripId]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    try {
      await updateTrip({
        id: tripId,
        data: {
          trip_number: form.trip_number,
          a_code: form.a_code || undefined,
          destination_from: form.destination_from,
          destination_to: form.destination_to,
          mileage: form.mileage ? Number(form.mileage) : undefined,
          driver_description: form.driver_description || undefined,
          admin_description: form.admin_description || undefined,
          invoice_number: form.invoice_number || undefined,
          amount: form.amount ? Number(form.amount) : undefined,
        },
      });
      navigate(`/app/trips/${tripId}`, { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update trip');
    }
  };

  if (!Number.isFinite(tripId)) return <Alert severity="error">Invalid trip id</Alert>;

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trip || !form) {
    return <Alert severity="error">{error ?? 'Trip not found'}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Edit trip
          </Typography>
          <Typography color="text.secondary">Update trip details and save changes.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate(`/app/trips/${tripId}`)}>
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
            <TextField label="Trip number" value={form.trip_number} onChange={(e) => setField('trip_number', e.target.value)} />
            <TextField label="A Code" value={form.a_code} onChange={(e) => setField('a_code', e.target.value)} />
            <TextField label="From" value={form.destination_from} onChange={(e) => setField('destination_from', e.target.value)} />
            <TextField label="To" value={form.destination_to} onChange={(e) => setField('destination_to', e.target.value)} />
            <TextField label="Mileage (km)" value={form.mileage} onChange={(e) => setField('mileage', e.target.value)} inputMode="numeric" />

            <Divider />

            <TextField
              label="Driver description"
              value={form.driver_description}
              onChange={(e) => setField('driver_description', e.target.value)}
              multiline
              minRows={3}
            />
            <TextField
              label="Admin description"
              value={form.admin_description}
              onChange={(e) => setField('admin_description', e.target.value)}
              multiline
              minRows={3}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Invoice number" value={form.invoice_number} onChange={(e) => setField('invoice_number', e.target.value)} />
              <TextField label="Amount" value={form.amount} onChange={(e) => setField('amount', e.target.value)} inputMode="decimal" />
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={updateTripMutation.isPending}>
              {updateTripMutation.isPending ? 'Updating…' : 'Update'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

