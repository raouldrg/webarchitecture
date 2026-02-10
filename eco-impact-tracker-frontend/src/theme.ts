import { createTheme, alpha } from '@mui/material/styles';

// Apple-like design system - minimal, premium, clean
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#16A34A', // Eco green
            light: '#22C55E',
            dark: '#15803D',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#6366F1', // Subtle indigo accent
            light: '#818CF8',
            dark: '#4F46E5',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
        },
        warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
        },
        success: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669',
        },
        background: {
            default: '#FAFAFA',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1D1D1F',
            secondary: '#6E6E73',
        },
        divider: '#E5E5EA',
        grey: {
            50: '#FAFAFA',
            100: '#F5F5F7',
            200: '#E8E8ED',
            300: '#D2D2D7',
            400: '#AEAEB2',
            500: '#8E8E93',
            600: '#636366',
            700: '#48484A',
            800: '#3A3A3C',
            900: '#1D1D1F',
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.35,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.005em',
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
            color: '#6E6E73',
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.5,
            color: '#6E6E73',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
        },
        caption: {
            fontSize: '0.75rem',
            color: '#6E6E73',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px rgba(0,0,0,0.04)',
        '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)',
        '0 6px 8px rgba(0,0,0,0.04), 0 3px 6px rgba(0,0,0,0.03)',
        '0 8px 16px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.03)',
        '0 12px 24px rgba(0,0,0,0.06), 0 6px 12px rgba(0,0,0,0.04)',
        '0 16px 32px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.04)',
        '0 20px 40px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.04)',
        '0 24px 48px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.05)',
        '0 28px 56px rgba(0,0,0,0.08), 0 14px 28px rgba(0,0,0,0.05)',
        '0 32px 64px rgba(0,0,0,0.09), 0 16px 32px rgba(0,0,0,0.06)',
        '0 36px 72px rgba(0,0,0,0.09), 0 18px 36px rgba(0,0,0,0.06)',
        '0 40px 80px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.06)',
        '0 44px 88px rgba(0,0,0,0.1), 0 22px 44px rgba(0,0,0,0.07)',
        '0 48px 96px rgba(0,0,0,0.11), 0 24px 48px rgba(0,0,0,0.07)',
        '0 52px 104px rgba(0,0,0,0.11), 0 26px 52px rgba(0,0,0,0.08)',
        '0 56px 112px rgba(0,0,0,0.12), 0 28px 56px rgba(0,0,0,0.08)',
        '0 60px 120px rgba(0,0,0,0.12), 0 30px 60px rgba(0,0,0,0.08)',
        '0 64px 128px rgba(0,0,0,0.13), 0 32px 64px rgba(0,0,0,0.09)',
        '0 68px 136px rgba(0,0,0,0.13), 0 34px 68px rgba(0,0,0,0.09)',
        '0 72px 144px rgba(0,0,0,0.14), 0 36px 72px rgba(0,0,0,0.1)',
        '0 76px 152px rgba(0,0,0,0.14), 0 38px 76px rgba(0,0,0,0.1)',
        '0 80px 160px rgba(0,0,0,0.15), 0 40px 80px rgba(0,0,0,0.1)',
        '0 84px 168px rgba(0,0,0,0.15), 0 42px 84px rgba(0,0,0,0.11)',
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollBehavior: 'smooth',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 20px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        transition: 'transform 0.2s ease',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                        backgroundColor: alpha('#16A34A', 0.04),
                    },
                },
                text: {
                    '&:hover': {
                        backgroundColor: alpha('#16A34A', 0.06),
                    },
                },
            },
            defaultProps: {
                disableElevation: true,
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: '#FFFFFF',
                        transition: 'all 0.2s ease',
                        '& fieldset': {
                            borderColor: '#E5E5EA',
                            borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                            borderColor: '#D2D2D7',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#16A34A',
                            borderWidth: '2px',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#6E6E73',
                        '&.Mui-focused': {
                            color: '#16A34A',
                        },
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                },
                elevation2: {
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)',
                },
            },
            defaultProps: {
                elevation: 0,
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid #E5E5EA',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 24,
                    '&:last-child': {
                        paddingBottom: 24,
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    padding: '24px 24px 16px',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '8px 24px 24px',
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '16px 24px 24px',
                    gap: 12,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    color: '#1D1D1F',
                    boxShadow: 'none',
                    borderBottom: '1px solid #E5E5EA',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#FAFAFA',
                    borderRight: '1px solid #E5E5EA',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    margin: '2px 8px',
                    padding: '10px 16px',
                    '&.Mui-selected': {
                        backgroundColor: alpha('#16A34A', 0.08),
                        color: '#16A34A',
                        '& .MuiListItemIcon-root': {
                            color: '#16A34A',
                        },
                        '&:hover': {
                            backgroundColor: alpha('#16A34A', 0.12),
                        },
                    },
                    '&:hover': {
                        backgroundColor: alpha('#1D1D1F', 0.04),
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: 40,
                    color: '#6E6E73',
                },
            },
        },
        MuiTable: {
            styleOverrides: {
                root: {
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid #E5E5EA',
                    boxShadow: 'none',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#F5F5F7',
                        fontWeight: 600,
                        color: '#6E6E73',
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '14px 16px',
                        borderBottom: '1px solid #E5E5EA',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: '#FAFAFA',
                    },
                    '&:last-child td': {
                        borderBottom: 'none',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: '16px',
                    borderBottom: '1px solid #E5E5EA',
                    fontSize: '0.9375rem',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontSize: '0.9375rem',
                },
                standardError: {
                    backgroundColor: alpha('#EF4444', 0.08),
                    color: '#DC2626',
                    '& .MuiAlert-icon': {
                        color: '#EF4444',
                    },
                },
                standardSuccess: {
                    backgroundColor: alpha('#10B981', 0.08),
                    color: '#059669',
                    '& .MuiAlert-icon': {
                        color: '#10B981',
                    },
                },
                standardWarning: {
                    backgroundColor: alpha('#F59E0B', 0.08),
                    color: '#D97706',
                    '& .MuiAlert-icon': {
                        color: '#F59E0B',
                    },
                },
                standardInfo: {
                    backgroundColor: alpha('#6366F1', 0.08),
                    color: '#4F46E5',
                    '& .MuiAlert-icon': {
                        color: '#6366F1',
                    },
                },
            },
        },
        MuiSnackbar: {
            styleOverrides: {
                root: {
                    '& .MuiPaper-root': {
                        borderRadius: 12,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    height: 8,
                    backgroundColor: '#E5E5EA',
                },
                bar: {
                    borderRadius: 10,
                },
            },
        },
        MuiSkeleton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#E8E8ED',
                },
                rounded: {
                    borderRadius: 12,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: alpha('#1D1D1F', 0.06),
                    },
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#1D1D1F',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    padding: '8px 12px',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #E5E5EA',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 6px',
                    padding: '10px 14px',
                    '&:hover': {
                        backgroundColor: alpha('#1D1D1F', 0.04),
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha('#16A34A', 0.08),
                        '&:hover': {
                            backgroundColor: alpha('#16A34A', 0.12),
                        },
                    },
                },
            },
        },
    },
});

export default theme;
