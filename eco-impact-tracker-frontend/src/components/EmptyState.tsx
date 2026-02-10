import React from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { InboxOutlined, Add as AddIcon } from '@mui/icons-material';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                textAlign: 'center',
            }}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    mb: 3,
                }}
            >
                {icon || <InboxOutlined sx={{ fontSize: 40 }} />}
            </Box>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1,
                }}
            >
                {title}
            </Typography>
            {description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        maxWidth: 360,
                        mb: action ? 3 : 0,
                    }}
                >
                    {description}
                </Typography>
            )}
            {action && (
                <Button
                    variant="contained"
                    startIcon={action.icon || <AddIcon />}
                    onClick={action.onClick}
                    sx={{ px: 3 }}
                >
                    {action.label}
                </Button>
            )}
        </Box>
    );
};
