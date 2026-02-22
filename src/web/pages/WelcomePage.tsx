import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldIcon from '@mui/icons-material/Shield';

import { AuthShell } from '@/src/web/components/AuthShell';
import { BrandMark } from '@/src/web/components/BrandMark';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <AuthShell>
      <Container maxWidth="md">
        <Box sx={{ display: 'grid', placeItems: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 980,
              p: { xs: 3, sm: 4 },
              backgroundColor: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <BrandMark />
              <Box>
                <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.96)' }}>
                  SweetTrip
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.80)' }}>
                  Fleet management made simple
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 3 }}>
              <Button variant="contained" size="large" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                Use a seeded user from <code>api/db.json</code>.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <FeatureCard
                icon={<MapIcon />}
                title="Real-time tracking"
                description="Monitor drivers and vehicles at a glance, in one place."
              />
              <FeatureCard
                icon={<TrendingUpIcon />}
                title="Smart analytics"
                description="See fleet performance trends and optimize operations."
              />
              <FeatureCard
                icon={<ShieldIcon />}
                title="Enterprise security"
                description="Role-based access for managers, admins, and drivers."
              />
            </Grid>
          </Paper>
        </Box>
      </Container>
    </AuthShell>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Grid item xs={12} md={4}>
      <Box
        sx={{
          height: '100%',
          p: 2,
          borderRadius: 3,
          background: 'rgba(11,18,32,0.45)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0,255,204,0.16)',
            color: '#00FFCC',
            mb: 1.5,
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.94)', fontWeight: 900, mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.76)' }}>
          {description}
        </Typography>
      </Box>
    </Grid>
  );
}

