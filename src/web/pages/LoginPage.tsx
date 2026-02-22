import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';

import { useAuth } from '@/src/hooks/useAuth';
import { AuthShell } from '@/src/web/components/AuthShell';
import { BrandMark } from '@/src/web/components/BrandMark';

export function LoginPage() {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = useMemo(() => location?.state?.from ?? '/app', [location?.state?.from]);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch {
      // error is set in context
    }
  };

  return (
    <AuthShell>
      <Container maxWidth="sm">
        <Box sx={{ display: 'grid', placeItems: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              p: { xs: 3, sm: 4 },
              backgroundColor: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2.5 }}>
              <BrandMark size={52} />
              <Box>
                <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.96)' }}>
                  Login
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.78)' }}>
                  Use your manager / driver credentials
                </Typography>
              </Box>
            </Box>

            {!!error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.84)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(11,18,32,0.50)',
                    color: 'rgba(255,255,255,0.92)',
                  },
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.84)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(11,18,32,0.50)',
                    color: 'rgba(255,255,255,0.92)',
                  },
                }}
              />
              <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                {isLoading ? 'Logging in…' : 'Login'}
              </Button>
              <Button
                type="button"
                variant="text"
                onClick={() => navigate('/', { replace: false })}
                sx={{ color: 'rgba(255,255,255,0.78)' }}
              >
                Back to Welcome
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </AuthShell>
  );
}

