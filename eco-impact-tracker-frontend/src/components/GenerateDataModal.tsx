import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Slider,
    alpha,
} from '@mui/material';
import { BoltOutlined, CheckCircleOutline } from '@mui/icons-material';
import { devApi } from '../api/devApi';
import type { GenerateUserDataResult } from '../api/devApi';

interface GenerateDataModalProps {
    open: boolean;
    onClose: () => void;
}

export const GenerateDataModal: React.FC<GenerateDataModalProps> = ({ open, onClose }) => {
    const [daysBack, setDaysBack] = useState(30);
    const [entriesRange, setEntriesRange] = useState<number[]>([1, 3]);
    const [includeGoals, setIncludeGoals] = useState(true);
    const [overwriteInRange, setOverwriteInRange] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<GenerateUserDataResult | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await devApi.generateUserData({
                daysBack,
                entriesPerDayMin: entriesRange[0],
                entriesPerDayMax: entriesRange[1],
                includeGoals,
                overwriteInRange,
            });
            setResult(data);

            // Auto-refresh after short delay to let user see the result
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err: unknown) {
            const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError('Session expired — please log in again.');
            } else {
                setError(error.response?.data?.message || error.message || 'Generation failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError('');
            setResult(null);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 700,
                    pb: 1,
                }}
            >
                <BoltOutlined sx={{ color: 'warning.main' }} />
                Generate Test Data
            </DialogTitle>

            <DialogContent>
                {result ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CheckCircleOutline sx={{ fontSize: 48, color: 'success.main', mb: 1.5 }} />
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Data Generated!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {result.createdEntries} entries + {result.createdGoals} goals
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {result.rangeStart} → {result.rangeEnd}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Refreshing page...
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                        <Box>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                Period (days back)
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                value={daysBack}
                                onChange={(e) => setDaysBack(Math.max(1, parseInt(e.target.value) || 1))}
                                inputProps={{ min: 1, max: 365 }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                Entries per day: {entriesRange[0]} – {entriesRange[1]}
                            </Typography>
                            <Slider
                                value={entriesRange}
                                onChange={(_, value) => setEntriesRange(value as number[])}
                                valueLabelDisplay="auto"
                                min={0}
                                max={8}
                                step={1}
                                sx={{ color: 'primary.main' }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={includeGoals}
                                        onChange={(e) => setIncludeGoals(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2">Include goals (2–4 weekly/monthly)</Typography>}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={overwriteInRange}
                                        onChange={(e) => setOverwriteInRange(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2">Overwrite existing data in range</Typography>}
                            />
                        </Box>

                        <Alert
                            severity="info"
                            sx={{
                                borderRadius: 2,
                                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.05),
                            }}
                        >
                            <Typography variant="caption">
                                Data is generated using existing activity templates from the catalogue.
                                Emissions are calculated exactly like normal usage.
                            </Typography>
                        </Alert>
                    </Box>
                )}
            </DialogContent>

            {!result && (
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleGenerate}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <BoltOutlined />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};
