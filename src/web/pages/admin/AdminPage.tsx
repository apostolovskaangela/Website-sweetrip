import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RouteIcon from '@mui/icons-material/Route';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';

import { useAuth } from '@/src/hooks/useAuth';
import { useTripsQuery, useUsersQuery, useVehiclesQuery, useTripMutations, useUserMutations, useVehicleMutations } from '@/src/hooks/queries';
import Offline from '@/src/services/offline';
import { storage } from '@/src/services/storage';

type Period = 'day' | 'week' | 'month';

function parseDateOnly(dateStr: unknown): Date | null {
  if (typeof dateStr !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d);
  // Guard against overflow (e.g. 2026-02-31)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// ISO week start: Monday
function startOfIsoWeek(d: Date) {
  const date = startOfDay(d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function getPeriodStart(now: Date, period: Period) {
  if (period === 'day') return startOfDay(now);
  if (period === 'week') return startOfIsoWeek(now);
  return startOfMonth(now);
}

function formatKm(value: number) {
  if (!Number.isFinite(value)) return '0';
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

function isDriver(user: any) {
  const roleId = Number(user?.role_id);
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roleId === 4 || roles.includes('driver');
}

function isCompletedTrip(t: any) {
  return String(t?.status ?? '').trim().toLowerCase() === 'completed';
}

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('admin') ?? false;

  const tripsQuery = useTripsQuery();
  const usersQuery = useUsersQuery();
  const vehiclesQuery = useVehiclesQuery();
  const { deleteTrip, deleteTripMutation } = useTripMutations();
  const { createDriver, createDriverMutation, deleteUser, deleteUserMutation } = useUserMutations();
  const { deleteVehicle, deleteVehicleMutation } = useVehicleMutations();

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{
    driverId: number;
    driverName: string;
    period: Period;
  } | null>(null);

  const [confirm, setConfirm] = useState<{ type: 'driver' | 'vehicle' | 'trip'; id: number; label: string } | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [queueSize, setQueueSize] = useState<number | null>(null);
  const [queueBusy, setQueueBusy] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addErr, setAddErr] = useState<string | null>(null);
  const [newDriver, setNewDriver] = useState<{ name: string; email: string; password: string }>({
    name: '',
    email: '',
    password: '',
  });

  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  React.useEffect(() => {
    let mounted = true;
    const readSize = async () => {
      try {
        const raw = await storage.getItem('OFFLINE_QUEUE_V1');
        const items = raw ? JSON.parse(raw) : [];
        const size = Array.isArray(items) ? items.length : 0;
        if (mounted) setQueueSize(size);
      } catch {
        if (mounted) setQueueSize(0);
      }
    };
    readSize().catch(() => {});
    const t = window.setInterval(() => readSize().catch(() => {}), 5000);
    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, []);

  const loading = tripsQuery.isLoading || usersQuery.isLoading || vehiclesQuery.isLoading;
  const error = tripsQuery.error || usersQuery.error || vehiclesQuery.error;

  const now = new Date();
  const trips = (tripsQuery.data ?? []) as any[];
  const users = (usersQuery.data ?? []) as any[];
  const vehicles = (vehiclesQuery.data ?? []) as any[];

  const drivers = useMemo(() => users.filter(isDriver), [users]);

  const searchLower = search.trim().toLowerCase();
  const filteredDrivers = useMemo(() => {
    if (!searchLower) return drivers;
    return drivers.filter((d: any) => {
      const name = String(d?.name ?? '').toLowerCase();
      const email = String(d?.email ?? '').toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower);
    });
  }, [drivers, searchLower]);

  const filteredVehicles = useMemo(() => {
    if (!searchLower) return vehicles;
    return vehicles.filter((v: any) => {
      const reg = String(v?.registration_number ?? '').toLowerCase();
      return reg.includes(searchLower);
    });
  }, [vehicles, searchLower]);

  const totalsByDriver = useMemo(() => {
    const byDriver = new Map<number, { day: number; week: number; month: number }>();
    const starts = {
      day: getPeriodStart(now, 'day'),
      week: getPeriodStart(now, 'week'),
      month: getPeriodStart(now, 'month'),
    };

    for (const t of trips) {
      if (!isCompletedTrip(t)) continue;
      const driverId = Number(t?.driver_id ?? t?.driver?.id);
      if (!Number.isFinite(driverId) || driverId === 0) continue;
      const mileage = Number(t?.mileage ?? 0);
      if (!Number.isFinite(mileage)) continue;
      const tripDate = parseDateOnly(t?.trip_date);
      if (!tripDate) continue;

      const cur = byDriver.get(driverId) ?? { day: 0, week: 0, month: 0 };
      if (tripDate >= starts.day) cur.day += mileage;
      if (tripDate >= starts.week) cur.week += mileage;
      if (tripDate >= starts.month) cur.month += mileage;
      byDriver.set(driverId, cur);
    }

    return byDriver;
  }, [trips, now]);

  const selectedTrips = useMemo(() => {
    if (!selected) return [];
    const start = getPeriodStart(now, selected.period);
    return trips
      .filter((t) => String(t?.driver_id ?? t?.driver?.id) === String(selected.driverId))
      .filter((t) => isCompletedTrip(t))
      .filter((t) => {
        const dt = parseDateOnly(t?.trip_date);
        return dt != null && dt >= start;
      })
      .sort((a, b) => String(b?.trip_date ?? '').localeCompare(String(a?.trip_date ?? '')));
  }, [selected, trips, now]);

  const onOpenTrips = (driverId: number, driverName: string, period: Period) => {
    setSelected({ driverId, driverName, period });
    setOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!confirm) return;
    setActionErr(null);
    try {
      if (confirm.type === 'driver') {
        await deleteUser(confirm.id);
      } else if (confirm.type === 'vehicle') {
        await deleteVehicle(confirm.id);
      } else {
        await deleteTrip(confirm.id);
      }
      setConfirm(null);
    } catch (e: any) {
      setActionErr(e?.message ?? 'Delete failed');
    }
  };

  const onProcessQueue = async () => {
    setQueueBusy(true);
    setActionErr(null);
    try {
      await Offline.processQueue(25);
      const raw = await storage.getItem('OFFLINE_QUEUE_V1');
      const items = raw ? JSON.parse(raw) : [];
      setQueueSize(Array.isArray(items) ? items.length : 0);
    } catch (e: any) {
      setActionErr(e?.message ?? 'Failed to process queue');
    } finally {
      setQueueBusy(false);
    }
  };

  const onClearQueue = async () => {
    setQueueBusy(true);
    setActionErr(null);
    try {
      await Offline.clearQueue();
      setQueueSize(0);
    } catch (e: any) {
      setActionErr(e?.message ?? 'Failed to clear queue');
    } finally {
      setQueueBusy(false);
    }
  };

  const onAddDriver = async () => {
    setAddErr(null);
    const name = newDriver.name.trim();
    const email = newDriver.email.trim().toLowerCase();
    const password = newDriver.password;

    if (!name) return setAddErr('Name is required');
    if (!email) return setAddErr('Email is required');
    if (!password) return setAddErr('Password is required');

    try {
      await createDriver({ name, email, password });
      setAddOpen(false);
      setNewDriver({ name: '', email: '', password: '' });
    } catch (e: any) {
      setAddErr(e?.message ?? 'Failed to add driver');
    }
  };

  if (!isAdmin) {
    return <Alert severity="error">Not authorized.</Alert>;
  }

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
            Admin
          </Typography>
          <Typography color="text.secondary">Manage drivers, vehicles, and operational data</Typography>
        </Box>
        <Chip
          icon={<AdminPanelSettingsIcon />}
          label="Admin only"
          sx={{ fontWeight: 900, px: 0.5 }}
          color="primary"
          variant="outlined"
        />
      </Box>

      {!!(actionErr || (error as any)?.message) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionErr || (error as any)?.message || 'Something went wrong'}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.75fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PeopleAltOutlinedIcon color="action" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Driver performance
              </Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ ml: 'auto' }}
                onClick={() => {
                  setAddErr(null);
                  setAddOpen(true);
                }}
              >
                Add driver
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TextField
              label="Search drivers or vehicles"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />

            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Driver</TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Today (km)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Week (km)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Month (km)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDrivers.map((d: any) => {
                    const driverId = Number(d.id);
                    const totals = totalsByDriver.get(driverId) ?? { day: 0, week: 0, month: 0 };
                    const label = `${d.name ?? 'Driver'} • ${d.email ?? ''}`;

                    return (
                      <TableRow key={String(driverId)}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 900 }} noWrap>
                            {d.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {d.email}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => onOpenTrips(driverId, d.name, 'day')}
                          >
                            {formatKm(totals.day)}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => onOpenTrips(driverId, d.name, 'week')}
                          >
                            {formatKm(totals.week)}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => onOpenTrips(driverId, d.name, 'month')}
                          >
                            {formatKm(totals.month)}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label="Delete driver"
                            onClick={() => setConfirm({ type: 'driver', id: driverId, label })}
                            disabled={deleteUserMutation.isPending}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDrivers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography color="text.secondary">No drivers found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CloudSyncOutlinedIcon color="action" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                System tools
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Box sx={{ display: 'grid', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 900 }}>Offline queue</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending requests: <strong>{queueSize ?? '—'}</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                  <Button size="small" variant="outlined" onClick={onProcessQueue} disabled={queueBusy}>
                    Process now
                  </Button>
                  <Button size="small" variant="outlined" color="warning" onClick={onClearQueue} disabled={queueBusy}>
                    Clear queue
                  </Button>
                  <Button size="small" variant="text" component={RouterLink} to="/app/offline-queue">
                    View queue
                  </Button>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'grid', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 900 }}>Quick links</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                  <Button size="small" variant="text" component={RouterLink} to="/app/trips" startIcon={<RouteIcon />}>
                    Trips
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    component={RouterLink}
                    to="/app/vehicles"
                    startIcon={<LocalShippingIcon />}
                  >
                    Vehicles
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocalShippingIcon color="action" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Vehicles
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Registration</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Trips
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVehicles.map((v: any) => {
                  const vehicleId = Number(v.id);
                  const inUse = trips.filter((t) => String(t?.vehicle_id) === String(vehicleId)).length;
                  const label = String(v.registration_number ?? `Vehicle ${vehicleId}`);
                  const isActive = (x: any) => x === true || x === 1 || x === '1';

                  return (
                    <TableRow key={String(vehicleId)}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 900 }}>{v.registration_number}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={isActive(v.is_active) ? 'Active' : 'Inactive'}
                          color={isActive(v.is_active) ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 900 }}
                        />
                      </TableCell>
                      <TableCell align="right">{inUse}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="Delete vehicle"
                          onClick={() => setConfirm({ type: 'vehicle', id: vehicleId, label })}
                          disabled={deleteVehicleMutation.isPending}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary">No vehicles found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <RouteIcon color="action" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Trips
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Trip</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Driver</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Mileage
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(trips ?? []).slice(0, 25).map((t: any) => {
                  const tripId = Number(t?.id);
                  const label = `Trip #${t?.trip_number ?? tripId}`;
                  return (
                    <TableRow key={String(tripId || t?.trip_number || Math.random())}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 900 }} noWrap>
                          #{t.trip_number} • {t.trip_date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {t.destination_from} → {t.destination_to}
                        </Typography>
                      </TableCell>
                      <TableCell>{t?.driver?.name ?? '—'}</TableCell>
                      <TableCell>{String(t?.status_label ?? t?.status ?? '')}</TableCell>
                      <TableCell align="right">{t?.mileage ?? '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="Delete trip"
                          onClick={() => setConfirm({ type: 'trip', id: tripId, label })}
                          disabled={deleteTripMutation.isPending}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(trips ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">No trips found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Showing latest 25 trips.
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Trips for {selected?.driverName ?? 'driver'} ({selected?.period})
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 1.25 }}>
            {selectedTrips.map((t: any) => (
              <Paper
                key={String(t?.id ?? t?.trip_number ?? Math.random())}
                variant="outlined"
                sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900 }} noWrap>
                    {t.destination_from} → {t.destination_to}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    #{t.trip_number} • {t.trip_date} • {formatKm(Number(t?.mileage ?? 0))} km
                  </Typography>
                </Box>
                <Button size="small" component={RouterLink} to={`/app/trips/${t.id}`} variant="outlined">
                  View
                </Button>
              </Paper>
            ))}
            {selectedTrips.length === 0 && <Typography color="text.secondary">No trips in this period.</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Delete <strong>{confirm?.label}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            onClick={onConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending || deleteVehicleMutation.isPending || deleteTripMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add new driver</DialogTitle>
        <DialogContent dividers>
          {!!addErr && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addErr}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField
              label="Full name"
              value={newDriver.name}
              onChange={(e) => setNewDriver((s) => ({ ...s, name: e.target.value }))}
              autoComplete="name"
              fullWidth
            />
            <TextField
              label="Email"
              value={newDriver.email}
              onChange={(e) => setNewDriver((s) => ({ ...s, email: e.target.value }))}
              autoComplete="email"
              fullWidth
            />
            <TextField
              label="Password"
              value={newDriver.password}
              onChange={(e) => setNewDriver((s) => ({ ...s, password: e.target.value }))}
              type="password"
              autoComplete="new-password"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onAddDriver} disabled={createDriverMutation.isPending}>
            {createDriverMutation.isPending ? 'Adding…' : 'Add driver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

