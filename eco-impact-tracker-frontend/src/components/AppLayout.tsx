import React from 'react';
import type { ReactNode } from 'react';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
    Avatar,
    alpha,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    ListAlt as ListAltIcon,
    Description as DescriptionIcon,
    Flag as FlagIcon,
    Logout as LogoutIcon,
    EnergySavingsLeaf as EcoIcon,
    FileDownloadOutlined,
    BoltOutlined,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { GenerateDataModal } from './GenerateDataModal';

const drawerWidth = 260;

interface AppLayoutProps {
    children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [generateModalOpen, setGenerateModalOpen] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Entries', icon: <ListAltIcon />, path: '/entries' },
        { text: 'Templates', icon: <DescriptionIcon />, path: '/templates' },
        { text: 'Goals', icon: <FlagIcon />, path: '/goals' },
        { text: 'Export', icon: <FileDownloadOutlined />, path: '/export' },
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Section */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2.5,
                    py: 3,
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                        color: 'white',
                    }}
                >
                    <EcoIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            lineHeight: 1.2,
                        }}
                    >
                        ECO Tracker
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Carbon Footprint
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2, borderColor: 'divider' }} />

            {/* Navigation */}
            <Box sx={{ px: 1.5, py: 2, flex: 1 }}>
                <Typography
                    variant="caption"
                    sx={{
                        px: 1.5,
                        py: 1,
                        display: 'block',
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontSize: '0.6875rem',
                    }}
                >
                    Menu
                </Typography>
                <List disablePadding>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: location.pathname === item.path ? 600 : 500,
                                        fontSize: '0.9375rem',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Generate Data */}
            <Box sx={{ px: 2, pb: 1 }}>
                <Divider sx={{ mb: 1.5, borderColor: 'divider' }} />
                <ListItemButton
                    onClick={() => setGenerateModalOpen(true)}
                    sx={{
                        borderRadius: 2,
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.warning.main, 0.08),
                            color: 'warning.dark',
                            '& .MuiListItemIcon-root': {
                                color: 'warning.dark',
                            },
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                        <BoltOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Generate Data"
                        primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                        }}
                    />
                </ListItemButton>
            </Box>

            {/* User Section */}
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        mb: 1.5,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: 'primary.main',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {user?.name || 'User'}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                            }}
                        >
                            {user?.email || ''}
                        </Typography>
                    </Box>
                </Box>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.06),
                            color: 'error.main',
                            '& .MuiListItemIcon-root': {
                                color: 'error.main',
                            },
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Sign out"
                        primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                        }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* AppBar - Mobile only */}
                <AppBar
                    position="fixed"
                    sx={{
                        display: { md: 'none' },
                        width: '100%',
                        ml: 0,
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                            ECO Tracker
                        </Typography>
                    </Toolbar>
                </AppBar>

                {/* Drawer */}
                <Box
                    component="nav"
                    sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                >
                    {/* Mobile Drawer */}
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>

                    {/* Desktop Drawer */}
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        backgroundColor: 'background.default',
                        minHeight: '100vh',
                    }}
                >
                    {/* Toolbar spacer for mobile */}
                    <Toolbar sx={{ display: { md: 'none' } }} />

                    {/* Content */}
                    <Box
                        sx={{
                            maxWidth: 1400,
                            mx: 'auto',
                            p: { xs: 2, sm: 3, md: 4 },
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>

            <GenerateDataModal
                open={generateModalOpen}
                onClose={() => setGenerateModalOpen(false)}
            />
        </>
    );
};
