import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
        disabled?: boolean;
    };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    action
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 4,
            }}
        >
            <Box>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                    }}
                >
                    {title}
                </Typography>
                {description && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        {description}
                    </Typography>
                )}
            </Box>
            {action && (
                <Button
                    variant="contained"
                    startIcon={action.icon || <AddIcon />}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    sx={{
                        flexShrink: 0,
                        px: 3,
                    }}
                >
                    {action.label}
                </Button>
            )}
        </Box>
    );
};
