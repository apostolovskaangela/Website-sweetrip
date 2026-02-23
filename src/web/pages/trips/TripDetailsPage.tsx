import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
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

import { tripsApi, type Trip } from '@/src/services/api/trips';
import { useAuth } from '@/src/hooks/useAuth';
import { RoleFactory } from '@/src/roles';
import { StatusChip } from '@/src/web/components/StatusChip';
import { useTripMutations, useTripQuery } from '@/src/hooks/queries';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_process', label: 'In Process' },
  { value: 'started', label: 'Started' },
  { value: 'completed', label: 'Completed' },
] as const;

export function TripDetailsPage() {
  const { id } = useParams();
  const tripId = Number.parseInt(String(id ?? ''), 10);
  const navigate = useNavigate();
  const { user } = useAuth();

  const roleHandler = useMemo(() => (user ? RoleFactory.createFromUser({ roles: user.roles }) : null), [user]);

  const [status, setStatus] = useState<string>('');
  const [cmrFile, setCmrFile] = useState<File | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const tripQuery = useTripQuery(Number.isFinite(tripId) && tripId !== 0 ? tripId : null);
  const { updateTripStatus, updateTripStatusMutation } = useTripMutations();

  const trip = (tripQuery.data as Trip | undefined) ?? null;
  const loading = tripQuery.isLoading;
  const err = (tripQuery.error as any)?.message ?? null;
  const tripStatus = trip?.status;

  React.useEffect(() => {
    if (!tripStatus) return;
    setStatus(tripStatus);
  }, [tripStatus]);

  const canEdit = roleHandler?.canEditTrip?.() ?? false;
  const canDriverUpdate = roleHandler?.canUpdateTripStatus?.(user?.id ?? '', trip?.driver?.id) ?? false;
  const canViewFinancials = roleHandler?.canViewTripFinancials?.() ?? false;
  const canViewNotes = roleHandler?.canViewTripNotes?.() ?? false;
  const canViewMileage = roleHandler?.canViewTripMileage?.() ?? false;

  const onUpdateStatus = async () => {
    if (!trip) return;
    setLocalErr(null);
    try {
      if (status === 'completed') {
        if (!cmrFile && !trip.cmr && !trip.cmr_url) {
          throw new Error('CMR image is required to complete the trip');
        }
        if (cmrFile) {
          const uri = URL.createObjectURL(cmrFile);
          await tripsApi.uploadCMR(tripId, { name: cmrFile.name, uri, type: cmrFile.type } as any);
        }
      }
      await updateTripStatus({ id: tripId, status: { status: status as any } });
    } catch (e: any) {
      setLocalErr(e?.message ?? 'Failed to update status');
    }
  };

  if (!Number.isFinite(tripId) || tripId === 0) return <Alert severity="error">Trip not found</Alert>;

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trip) {
    return <Alert severity="error">{err ?? 'Trip not found'}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Trip #{trip.trip_number}
          </Typography>
          <Typography color="text.secondary">
            {trip.destination_from} → {trip.destination_to} • {trip.trip_date}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/app/trips')}>
            Back
          </Button>
          {canEdit && (
            <Button component={RouterLink} to={`/app/trips/${trip.id}/edit`} variant="contained">
              Edit
            </Button>
          )}
        </Box>
      </Box>

      {!!(localErr || err) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {localErr || err}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Details
            </Typography>
            <StatusChip status={trip.status} label={trip.status_label} />
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'grid', gap: 1 }}>
            <Typography>
              <strong>Vehicle:</strong> {trip.vehicle?.registration_number ?? 'N/A'}
            </Typography>
            <Typography>
              <strong>Driver:</strong> {trip.driver?.name ?? 'N/A'}
            </Typography>
            {!!trip.driver_description && (
              <Typography>
                <strong>Driver notes:</strong> {trip.driver_description}
              </Typography>
            )}
            {canViewNotes && !!trip.admin_description && (
              <Typography>
                <strong>Admin notes:</strong> {trip.admin_description}
              </Typography>
            )}
            {canViewFinancials && !!trip.invoice_number && (
              <Typography>
                <strong>Invoice:</strong> {trip.invoice_number}
              </Typography>
            )}
            {canViewFinancials && trip.amount != null && (
              <Typography>
                <strong>Amount:</strong> {trip.amount}
              </Typography>
            )}
            {canViewMileage && trip.mileage != null && (
              <Typography>
                <strong>Mileage:</strong> {trip.mileage} km
              </Typography>
            )}
            {!!trip.cmr_url && (
              <Typography>
                <strong>CMR:</strong> <a href={trip.cmr_url} target="_blank" rel="noreferrer">Open</a>
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {canDriverUpdate && (
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Update status
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
              <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              {status === 'completed' && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Completing requires a CMR image.
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCmrFile(e.target.files?.[0] ?? null)}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                onClick={onUpdateStatus}
                disabled={updateTripStatusMutation.isPending}
              >
                {updateTripStatusMutation.isPending ? 'Saving…' : 'Update'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

