import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WifiOffIcon from '@mui/icons-material/WifiOff';

import { useAuth } from '@/src/hooks/useAuth';
import { useIsOffline } from '@/src/hooks/useIsOffline';
import { RoleFactory } from '@/src/roles';
import { WebThemeContext } from '../theme/WebThemeProvider';
import { BrandMark } from '@/src/web/components/BrandMark';

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  hidden?: boolean;
};

const DRAWER_WIDTH = 280;

export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const isOffline = useIsOffline();
  const roleHandler = useMemo(() => (user ? RoleFactory.createFromUser({ roles: user.roles }) : null), [user]);
  const webTheme = React.useContext(WebThemeContext);

  const items: NavItem[] = useMemo(
    () => [
      { label: 'Dashboard', path: '/app/dashboard', icon: <DashboardIcon /> },
      { label: 'Trips', path: '/app/trips', icon: <RouteIcon /> },
      { label: 'Vehicles', path: '/app/vehicles', icon: <LocalShippingIcon />, hidden: !(roleHandler?.canViewVehicles?.() ?? false) },
      { label: 'Admin', path: '/app/admin', icon: <AdminPanelSettingsIcon />, hidden: !(user?.roles?.includes('admin') ?? false) },
      { label: 'Offline Queue', path: '/app/offline-queue', icon: <CloudOffIcon />, hidden: !isOffline },
    ],
    [isOffline, roleHandler, user?.roles]
  );

  const onNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0A4FBF',
        color: '#fff',
      }}
    >
      <Box sx={{ px: 2, py: 2.25, display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <BrandMark size={34} variant="orange" />
        <Typography sx={{ fontWeight: 900, letterSpacing: -0.2 }}>Sweetrip</Typography>
      </Box>

      <Box sx={{ px: 2, pb: 1 }}>
        {isOffline && (
          <Chip
            size="small"
            icon={<WifiOffIcon sx={{ color: '#fff !important' }} />}
            label="Offline"
            sx={{
              color: '#fff',
              fontWeight: 800,
              bgcolor: 'rgba(255,255,255,0.14)',
              '& .MuiChip-icon': { color: '#fff' },
            }}
          />
        )}
      </Box>

      <List sx={{ flex: 1, px: 1 }}>
        {items
          .filter((i) => !i.hidden)
          .map((i) => {
            const selected = location.pathname === i.path || location.pathname.startsWith(i.path + '/');
            return (
              <ListItemButton
                key={i.path}
                selected={selected}
                onClick={() => onNav(i.path)}
                sx={{
                  borderRadius: 2.5,
                  mx: 1,
                  my: 0.75,
                  color: 'rgba(255,255,255,0.92)',
                  '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.92)' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.14)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{i.icon}</ListItemIcon>
                <ListItemText
                  primary={i.label}
                  primaryTypographyProps={{ fontWeight: selected ? 900 : 700, fontSize: 14 }}
                />
              </ListItemButton>
            );
          })}
      </List>

      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
          <Badge
            overlap="circular"
            variant="dot"
            color={isOffline ? 'warning' : 'success'}
            sx={{
              '& .MuiBadge-badge': { boxShadow: `0 0 0 2px rgba(10,79,191,1)` },
            }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.18)' }}>
              {(user?.name?.[0] ?? 'U').toUpperCase()}
            </Avatar>
          </Badge>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 13 }} noWrap>
              {user?.name ?? 'User'}
            </Typography>
            <Typography sx={{ opacity: 0.8, fontSize: 12 }} noWrap>
              {user?.roles?.[0] ?? 'user'}
            </Typography>
          </Box>
          <IconButton
            onClick={() => webTheme?.toggle?.()}
            sx={{
              ml: 'auto',
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.10)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
            }}
          >
            <DarkModeIcon fontSize="small" />
          </IconButton>
        </Box>

        <ListItemButton
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          sx={{
            borderRadius: 2.5,
            color: 'rgba(255,255,255,0.92)',
            bgcolor: 'rgba(255,255,255,0.10)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255,255,255,0.92)' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      {/* Mobile top bar */}
      {!isDesktop && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.drawer + 1,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          }}
        >
          <IconButton onClick={() => setMobileOpen((v) => !v)}>
            <MenuIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 900, ml: 0.5 }}>{getHeaderTitle(location.pathname)}</Typography>
          {isOffline && (
            <Chip
              size="small"
              icon={<WifiOffIcon />}
              label="Offline"
              sx={{
                ml: 'auto',
                fontWeight: 800,
                backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
              }}
            />
          )}
        </Box>
      )}

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {!isDesktop && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
            }}
          >
            {drawer}
          </Drawer>
        )}
        {isDesktop && (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: 'none',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: { xs: 8, md: 3 },
          pb: 3,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function getHeaderTitle(pathname: string) {
  if (pathname.startsWith('/app/trips')) return 'Trips';
  if (pathname.startsWith('/app/vehicles')) return 'Vehicles';
  if (pathname.startsWith('/app/offline-queue')) return 'Offline Queue';
  if (pathname.startsWith('/app/admin')) return 'Admin';
  return 'Dashboard';
}

