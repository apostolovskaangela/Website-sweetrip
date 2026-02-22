import React from 'react';
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import { useAuth } from '@/src/hooks/useAuth';
import { useDashboardQuery } from '@/src/hooks/queries';
import { StatusChip } from '@/src/web/components/StatusChip';

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(0,122,255,0.16), rgba(0,255,204,0.10))',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isDriver = user?.roles?.includes('driver') ?? false;
  const { data, isLoading } = useDashboardQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = data?.stats;

  return (
    <Box sx={{ maxWidth: 1180 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.25 }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">Monitor your fleet operations in real-time</Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <StatCard title="Distance Today" value={`${stats?.distance_today ?? 0} km`} icon={<AltRouteIcon color="primary" />} />
        <StatCard title="Active Trips" value={String(stats?.active_trips ?? 0)} icon={<RouteIcon color="primary" />} />
        <StatCard title="Efficiency" value={`${(stats?.efficiency ?? 0).toFixed(2)}%`} icon={<TrendingUpIcon color="primary" />} />
        <StatCard title="Total vehicles" value={String(stats?.total_vehicles ?? 0)} icon={<LocalShippingIcon color="primary" />} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' }, gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Inventory2Icon color="action" />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Recent Trips
                </Typography>
              </Box>
              {data?.recent_trips?.length ? (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {data.recent_trips.slice(0, 5).map((t) => (
                    <Box
                      key={t.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 3,
                        bgcolor: 'background.default',
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900 }} noWrap>
                          {t.destination_from} → {t.destination_to}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          #{t.trip_number} • {t.driver?.name ?? '—'}
                        </Typography>
                      </Box>
                      <StatusChip status={t.status} label={t.status_label} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No trips yet.</Typography>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DirectionsCarIcon color="action" />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Vehicle Status
                </Typography>
              </Box>
              {isDriver ? (
                <Typography color="text.secondary">Vehicle status is available for managers/admins.</Typography>
              ) : data?.vehicles?.length ? (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {data.vehicles.slice(0, 5).map((v) => (
                    <Box
                      key={v.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 3,
                        bgcolor: 'background.default',
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900 }} noWrap>
                          {v.registration_number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {v.is_active ? 'Ready for dispatch' : 'Inactive'}
                        </Typography>
                      </Box>
                      <StatusChip status={v.is_active ? 'completed' : 'not_started'} label={v.is_active ? 'Active' : 'Inactive'} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No vehicles yet.</Typography>
              )}
            </CardContent>
          </Card>
      </Box>
    </Box>
  );
}

