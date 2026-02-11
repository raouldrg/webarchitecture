import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface FormDialogProps {
    open: boolean;
    title: string;
    children: React.ReactNode;
    submitLabel?: string;
    cancelLabel?: string;
    onSubmit: () => void;
    onCancel: () => void;
    loading?: boolean;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export const FormDialog: React.FC<FormDialogProps> = ({
    open,
    title,
    children,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    onSubmit,
    onCancel,
    loading = false,
    maxWidth = 'sm',
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pr: 1,
                }}
            >
                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <IconButton
                    onClick={onCancel}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: 'grey.100',
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>{children}</Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    color="inherit"
                    disabled={loading}
                    sx={{
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: 'divider',
                            backgroundColor: 'grey.50',
                        },
                    }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    onClick={onSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
