import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    Tooltip,
    Chip,
    LinearProgress,
    Typography,
    alpha,
} from '@mui/material';
import {
    DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon,
    Add as AddIcon,
    FlagOutlined,
    CheckCircleOutlined,
    WarningAmberOutlined,
} from '@mui/icons-material';
import { goalsApi } from '../api/goalsApi';
import type { Goal, GoalRequest } from '../api/goalsApi';
import { statsApi } from '../api/statsApi';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormDialog } from '../components/FormDialog';
import { format } from 'date-fns';

const PERIOD_LABELS: Record<string, string> = {
    DAY: 'Daily',
    WEEK: 'Weekly',
    MONTH: 'Monthly',
};

export const GoalsPage: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [goalsProgress, setGoalsProgress] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
        open: false,
        id: null,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Use string for targetCo2 during editing to allow empty input
    const [targetCo2Text, setTargetCo2Text] = useState('');
    const [targetCo2Error, setTargetCo2Error] = useState('');
    const [formData, setFormData] = useState<Omit<GoalRequest, 'targetCo2'> & { period: 'DAY' | 'WEEK' | 'MONTH'; startDate: string; endDate: string }>({
        period: 'MONTH',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });

    const fetchGoals = async () => {
        setLoading(true);
        setError('');
        try {
            const goalsData = await goalsApi.getAll();
            setGoals(goalsData);

            if (goalsData.length > 0 && goalsData.length <= 10) {
                const progressData: Record<number, number> = {};
                await Promise.all(
                    goalsData.map(async (goal) => {
                        try {
                            const stats = await statsApi.getSummary(goal.startDate, goal.endDate);
                            const progress = (stats.totalCo2 / goal.targetCo2) * 100;
                            progressData[goal.id] = Math.min(progress, 150);
                        } catch {
                            progressData[goal.id] = 0;
                        }
                    })
                );
                setGoalsProgress(progressData);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleOpenDialog = (goal?: Goal) => {
        if (goal) {
            setEditingGoal(goal);
            setTargetCo2Text(String(goal.targetCo2));
            setTargetCo2Error('');
            setFormData({
                period: goal.period,
                startDate: goal.startDate,
                endDate: goal.endDate,
            });
        } else {
            setEditingGoal(null);
            setTargetCo2Text('');
            setTargetCo2Error('');
            setFormData({
                period: 'MONTH',
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd'),
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingGoal(null);
    };

    const handleSubmit = async () => {
        // Validate targetCo2
        const trimmedValue = targetCo2Text.trim();
        if (!trimmedValue) {
            setTargetCo2Error('Target CO₂ is required');
            return;
        }
        const targetCo2 = Number(trimmedValue);
        if (isNaN(targetCo2) || targetCo2 <= 0) {
            setTargetCo2Error('Target CO₂ must be greater than 0');
            return;
        }
        setTargetCo2Error('');

        // Validate dates
        if (formData.startDate > formData.endDate) {
            setSnackbar({ open: true, message: 'Start date must be before or equal to end date', severity: 'error' });
            return;
        }

        const goalData: GoalRequest = {
            ...formData,
            targetCo2,
        };

        // Debug: log the payload being sent
        console.log('[GoalsPage] Submitting goal:', JSON.stringify(goalData, null, 2));

        try {
            if (editingGoal) {
                await goalsApi.update(editingGoal.id, goalData);
                setSnackbar({ open: true, message: 'Goal updated successfully', severity: 'success' });
            } else {
                await goalsApi.create(goalData);
                setSnackbar({ open: true, message: 'Goal created successfully', severity: 'success' });
            }
            handleCloseDialog();
            fetchGoals();
        } catch (err: unknown) {
            const error = err as { response?: { status?: number; data?: { message?: string; error?: string } }; message?: string };
            // Enhanced error logging for debugging
            console.error('[GoalsPage] Create/Update failed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Operation failed';
            const statusText = error.response?.status ? `[${error.response.status}] ` : '';
            setSnackbar({ open: true, message: `${statusText}${errorMessage}`, severity: 'error' });
        }
    };

    const handleDelete = async () => {
        if (deleteDialog.id) {
            try {
                await goalsApi.delete(deleteDialog.id);
                setSnackbar({ open: true, message: 'Goal deleted successfully', severity: 'success' });
                fetchGoals();
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                setSnackbar({ open: true, message: error.response?.data?.message || 'Delete failed', severity: 'error' });
            }
        }
        setDeleteDialog({ open: false, id: null });
    };

    const getProgressColor = (progress: number) => {
        if (progress > 100) return 'error';
        if (progress > 80) return 'warning';
        return 'success';
    };

    const getStatusIcon = (progress: number) => {
        if (progress > 100) return <WarningAmberOutlined sx={{ fontSize: 18, color: 'error.main' }} />;
        if (progress >= 100) return <CheckCircleOutlined sx={{ fontSize: 18, color: 'success.main' }} />;
        return null;
    };

    return (
        <Box>
            <PageHeader
                title="Goals"
                description="Set CO₂ emission limits and track your progress"
                action={{
                    label: 'Add Goal',
                    onClick: () => handleOpenDialog(),
                    icon: <AddIcon />,
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Loading variant="table" count={5} />
            ) : goals.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<FlagOutlined sx={{ fontSize: 40 }} />}
                        title="No goals yet"
                        description="Set carbon emission goals to track your environmental impact progress."
                        action={{
                            label: 'Create your first goal',
                            onClick: () => handleOpenDialog(),
                        }}
                    />
                </Card>
            ) : (
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Period</TableCell>
                                    <TableCell align="right">Target CO₂</TableCell>
                                    <TableCell>Date Range</TableCell>
                                    <TableCell sx={{ minWidth: 200 }}>Progress</TableCell>
                                    <TableCell align="right" sx={{ width: 100 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {goals.map((goal) => {
                                    const progress = goalsProgress[goal.id] || 0;
                                    const progressColor = getProgressColor(progress);

                                    return (
                                        <TableRow key={goal.id}>
                                            <TableCell>
                                                <Chip
                                                    label={PERIOD_LABELS[goal.period] || goal.period}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'primary.50',
                                                        color: 'primary.main',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography fontWeight={600}>
                                                    {goal.targetCo2} kg
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {goal.startDate} → {goal.endDate}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min(progress, 100)}
                                                            color={progressColor}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                backgroundColor: (theme) =>
                                                                    alpha(theme.palette[progressColor].main, 0.12),
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ minWidth: 60, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        {getStatusIcon(progress)}
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={600}
                                                            color={`${progressColor}.main`}
                                                        >
                                                            {Math.round(progress)}%
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenDialog(goal)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setDeleteDialog({ open: true, id: goal.id })}
                                                            sx={{ color: 'error.main' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {/* Form Dialog */}
            <FormDialog
                open={openDialog}
                title={editingGoal ? 'Edit Goal' : 'Add Goal'}
                onSubmit={handleSubmit}
                onCancel={handleCloseDialog}
                submitLabel={editingGoal ? 'Update' : 'Create'}
            >
                <TextField
                    select
                    fullWidth
                    label="Period"
                    value={formData.period}
                    onChange={(e) =>
                        setFormData({ ...formData, period: e.target.value as 'DAY' | 'WEEK' | 'MONTH' })
                    }
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="DAY">Daily</MenuItem>
                    <MenuItem value="WEEK">Weekly</MenuItem>
                    <MenuItem value="MONTH">Monthly</MenuItem>
                </TextField>
                <TextField
                    fullWidth
                    label="Target CO₂ (kg)"
                    type="text"
                    inputMode="decimal"
                    value={targetCo2Text}
                    onChange={(e) => {
                        // Allow empty string, digits, and decimal point only
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setTargetCo2Text(value);
                            setTargetCo2Error('');
                        }
                    }}
                    error={!!targetCo2Error}
                    helperText={targetCo2Error || 'Maximum CO₂ emissions allowed for this period'}
                    placeholder="Enter target CO₂"
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />
            </FormDialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                title="Delete Goal"
                message="Are you sure you want to delete this goal? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteDialog({ open: false, id: null })}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" elevation={6}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
