import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Alert,
    Link as MuiLink,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    EmailOutlined,
    LockOutlined,
    PersonOutlined,
    EnergySavingsLeaf,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FAFAFA 0%, #F0FDF4 50%, #FAFAFA 100%)',
                px: 2,
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 420,
                }}
            >
                {/* Logo & Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                            color: 'white',
                            mb: 3,
                            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
                        }}
                    >
                        <EnergySavingsLeaf sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            mb: 1,
                        }}
                    >
                        Create account
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Start tracking your environmental impact
                    </Typography>
                </Box>

                {/* Register Card */}
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                                autoFocus
                                sx={{ mb: 2.5 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                sx={{ mb: 2.5 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                sx={{ mb: 3 }}
                                helperText="Use at least 8 characters"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff sx={{ fontSize: 20 }} />
                                                ) : (
                                                    <Visibility sx={{ fontSize: 20 }} />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    mb: 2,
                                }}
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <MuiLink
                                        component={Link}
                                        to="/login"
                                        sx={{
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Sign in
                                    </MuiLink>
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        textAlign: 'center',
                        mt: 4,
                    }}
                >
                    Track your carbon footprint, make a difference
                </Typography>
            </Box>
        </Box>
    );
};
