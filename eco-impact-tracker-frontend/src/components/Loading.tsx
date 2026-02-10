import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingProps {
    message?: string;
    variant?: 'spinner' | 'skeleton' | 'cards' | 'table';
    count?: number;
}

export const Loading: React.FC<LoadingProps> = ({
    variant = 'skeleton',
    count = 3
}) => {
    if (variant === 'cards') {
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {Array.from({ length: count }).map((_, index) => (
                    <Box key={index} sx={{ flex: '1 1 300px', minWidth: 280 }}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="30%" height={16} />
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>
        );
    }

    if (variant === 'table') {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
                    </Box>
                    {Array.from({ length: count }).map((_, index) => (
                        <Box key={index} sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Skeleton variant="text" width="15%" />
                                <Skeleton variant="text" width="25%" />
                                <Skeleton variant="text" width="15%" />
                                <Skeleton variant="text" width="20%" />
                                <Skeleton variant="text" width="10%" />
                            </Box>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        );
    }

    // Default skeleton
    return (
        <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Skeleton variant="rectangular" width="33%" height={56} sx={{ borderRadius: 2 }} />
                        <Skeleton variant="rectangular" width="33%" height={56} sx={{ borderRadius: 2 }} />
                        <Skeleton variant="rectangular" width="33%" height={56} sx={{ borderRadius: 2 }} />
                    </Box>
                </CardContent>
            </Card>
            <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardContent>
                            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardContent>
                            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
