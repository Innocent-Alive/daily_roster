import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardFilled,
  DashboardOutlined,
  Assignment as RosterFilled,
  AssignmentOutlined as RosterOutlined,
  People as PeopleFilled,
  PeopleOutlined,
  LocationCity as AreaFilled,
  LocationCityOutlined as AreaOutlined,
  AccessTime as ShiftFilled,
  AccessTimeOutlined as ShiftOutlined,
  History as HistoryFilled,
  HistoryOutlined,
  Settings as SettingsFilled,
  SettingsOutlined,
  Logout,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { ColorModeContext } from '../context/ThemeContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', iconFilled: <DashboardFilled />, iconOutlined: <DashboardOutlined />, path: '/' },
  { text: 'Duty Roster', iconFilled: <RosterFilled />, iconOutlined: <RosterOutlined />, path: '/roster' },
  { text: 'Employees', iconFilled: <PeopleFilled />, iconOutlined: <PeopleOutlined />, path: '/employees' },
  { text: 'Areas', iconFilled: <AreaFilled />, iconOutlined: <AreaOutlined />, path: '/areas' },
  { text: 'Shifts', iconFilled: <ShiftFilled />, iconOutlined: <ShiftOutlined />, path: '/shifts' },
  { text: 'History', iconFilled: <HistoryFilled />, iconOutlined: <HistoryOutlined />, path: '/history' },
  { text: 'Settings', iconFilled: <SettingsFilled />, iconOutlined: <SettingsOutlined />, path: '/settings' },
];

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: theme.palette.mode === 'light' ? '#1565C0' : '#1E1E1E',
          color: '#ffffff',
        }}
      >
        <Avatar sx={{ bgcolor: '#42A5F5', width: 40, height: 40 }}>
          <HotelIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
            Duty Roster
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
            {user?.hotelName || 'Hotel Operations'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1.2,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'light' ? '#E3F2FD' : 'rgba(66, 165, 245, 0.16)',
                    color: '#1565C0',
                    fontWeight: 700,
                    '& .MuiListItemIcon-root': {
                      color: '#1565C0',
                    },
                  },
                  '&:hover': {
                    borderRadius: '8px',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: selected ? '#1565C0' : 'text.secondary' }}>
                  {selected ? item.iconFilled : item.iconOutlined}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: selected ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Info / Quick Logout */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
            {user?.name?.charAt(0) || 'M'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {user?.name || 'Manager'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role || 'Hotel Manager'}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" color="error" onClick={handleLogout}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Top Navbar (Mobile Only) */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          width: '100%',
          backgroundColor: '#FFFFFF',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
              {user?.hotelName || 'Duty Roster System'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 38, height: 38 }}>
                {user?.name?.charAt(0) || 'M'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 160, mt: 1 } }}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                <SettingsOutlined fontSize="small" sx={{ mr: 1.5 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout fontSize="small" sx={{ mr: 1.5 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Responsive Drawer Navigation */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          mt: { xs: 7, md: 0 },
          mb: { xs: 8, md: 0 }, // Extra padding for mobile bottom bar
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile Bottom Navigation (Edge-to-Edge Flush) */}
      {isMobile && !mobileOpen && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            borderRadius: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
          }}
          elevation={8}
        >
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(event, newValue) => {
              navigate(newValue);
            }}
            sx={{
              height: 60,
              backgroundColor: 'transparent',
              px: 1,
              justifyContent: 'space-around',
              '& .MuiBottomNavigationAction-root': {
                color: '#64748B',
                minWidth: 'auto',
                padding: '6px 8px',
                margin: 'auto 2px',
                borderRadius: '16px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.35rem',
                  transition: 'transform 0.2s ease',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  mt: 0.2,
                  transition: 'all 0.2s ease',
                },
                '&.Mui-selected': {
                  backgroundColor: '#1565C0',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(21, 101, 192, 0.35)',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.4rem',
                    color: '#FFFFFF',
                    transform: 'scale(1.1)',
                  },
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                  },
                },
              },
            }}
          >
            <BottomNavigationAction label="Dashboard" value="/" icon={location.pathname === '/' ? <DashboardFilled /> : <DashboardOutlined />} />
            <BottomNavigationAction label="Roster" value="/roster" icon={location.pathname === '/roster' ? <RosterFilled /> : <RosterOutlined />} />
            <BottomNavigationAction label="Employees" value="/employees" icon={location.pathname === '/employees' ? <PeopleFilled /> : <PeopleOutlined />} />
            <BottomNavigationAction label="History" value="/history" icon={location.pathname === '/history' ? <HistoryFilled /> : <HistoryOutlined />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
