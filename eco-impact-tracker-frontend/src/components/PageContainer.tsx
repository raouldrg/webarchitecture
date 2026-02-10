import React from 'react';
import { Box, Container } from '@mui/material';

interface PageContainerProps {
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    maxWidth = 'lg'
}) => {
    return (
        <Container maxWidth={maxWidth} disableGutters>
            <Box
                sx={{
                    py: { xs: 3, md: 4 },
                    px: { xs: 2, sm: 3 },
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {children}
            </Box>
        </Container>
    );
};
