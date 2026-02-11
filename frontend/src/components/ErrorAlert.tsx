import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorAlertProps {
    error: string | Error;
    title?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, title = 'Error' }) => {
    const message = typeof error === 'string' ? error : error.message;

    return (
        <Box my={2}>
            <Alert severity="error">
                <AlertTitle>{title}</AlertTitle>
                {message}
            </Alert>
        </Box>
    );
};
