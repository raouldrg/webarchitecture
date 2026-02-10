import React from 'react';
import { Box, Card, CardContent, Typography, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label?: string;
    };
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = 'primary',
}) => {
    const isPositiveTrend = trend && trend.value >= 0;

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: (theme) =>
                        `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontSize: '0.75rem',
                                mb: 1,
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h3"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                lineHeight: 1.2,
                            }}
                        >
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                        {trend && (
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mt: 1.5,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 2,
                                    backgroundColor: (theme) =>
                                        alpha(
                                            isPositiveTrend
                                                ? theme.palette.success.main
                                                : theme.palette.error.main,
                                            0.08
                                        ),
                                }}
                            >
                                {isPositiveTrend ? (
                                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                    <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                                )}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 600,
                                        color: isPositiveTrend ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {Math.abs(trend.value)}%{trend.label && ` ${trend.label}`}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    {icon && (
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 3,
                                backgroundColor: (theme) => alpha(theme.palette[color].main, 0.08),
                                color: `${color}.main`,
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
