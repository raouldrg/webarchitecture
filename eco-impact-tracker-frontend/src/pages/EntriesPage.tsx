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
    Snackbar,
    Alert,
    Tooltip,
    Chip,
    Button,
    Typography,
    alpha,
} from '@mui/material';
import {
    DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon,
    Add as AddIcon,
    ListAltOutlined,
    Co2Outlined,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { entriesApi } from '../api/entriesApi';
import type { Entry, EntryRequest } from '../api/entriesApi';
import { templatesApi } from '../api/templatesApi';
import type { ActivityTemplate } from '../api/templatesApi';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormDialog } from '../components/FormDialog';
import { TemplatePicker } from '../components/TemplatePicker';

export const EntriesPage: React.FC = () => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Template picker state
    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);

    // Entry form dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
        open: false,
        id: null,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Use string for quantity during editing to allow empty input
    const [quantityText, setQuantityText] = useState('');
    const [formData, setFormData] = useState<Omit<EntryRequest, 'quantity'> & { date: string; note: string; activityTemplateId: number }>({
        date: format(new Date(), 'yyyy-MM-dd'),
        note: '',
        activityTemplateId: 0,
    });
    const [quantityError, setQuantityError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [entriesData, templatesData] = await Promise.all([
                entriesApi.getAll(),
                templatesApi.getAll(),
            ]);
            setEntries(entriesData);
            setTemplates(templatesData);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Open template picker for new entry
    const handleAddEntry = () => {
        setEditingEntry(null);
        setPickerOpen(true);
    };

    // Handle template selection from picker
    const handleTemplateSelect = (template: ActivityTemplate) => {
        setSelectedTemplate(template);
        setPickerOpen(false);

        // Pre-fill form with template data
        setQuantityText('');
        setQuantityError('');
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            note: '',
            activityTemplateId: template.id,
        });

        setOpenDialog(true);
    };

    // Edit existing entry (skip picker, use existing template)
    const handleEditEntry = (entry: Entry) => {
        setEditingEntry(entry);
        setSelectedTemplate(entry.activityTemplate ? {
            id: entry.activityTemplate.id,
            name: entry.activityTemplate.name,
            co2Factor: entry.activityTemplate.co2Factor,
            defaultUnit: entry.activityTemplate.defaultUnit,
        } : null);
        setQuantityText(String(entry.quantity));
        setQuantityError('');
        setFormData({
            date: entry.date,
            note: entry.note || '',
            activityTemplateId: entry.activityTemplate?.id || 0,
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEntry(null);
        setSelectedTemplate(null);
    };

    const handleSubmit = async () => {
        // Validate quantity
        const trimmedQuantity = quantityText.trim();
        if (!trimmedQuantity) {
            setQuantityError('Quantity is required');
            return;
        }
        const quantity = Number(trimmedQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            setQuantityError('Quantity must be greater than 0');
            return;
        }
        setQuantityError('');

        const entryData: EntryRequest = {
            ...formData,
            quantity,
        };

        try {
            if (editingEntry) {
                await entriesApi.update(editingEntry.id, entryData);
                setSnackbar({ open: true, message: 'Entry updated successfully', severity: 'success' });
            } else {
                await entriesApi.create(entryData);
                setSnackbar({ open: true, message: 'Entry created successfully', severity: 'success' });
            }
            handleCloseDialog();
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setSnackbar({ open: true, message: error.response?.data?.message || 'Operation failed', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        if (deleteDialog.id) {
            try {
                await entriesApi.delete(deleteDialog.id);
                setSnackbar({ open: true, message: 'Entry deleted successfully', severity: 'success' });
                fetchData();
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                setSnackbar({ open: true, message: error.response?.data?.message || 'Delete failed', severity: 'error' });
            }
        }
        setDeleteDialog({ open: false, id: null });
    };

    const calculateCo2 = (entry: Entry) => {
        return (entry.quantity * (entry.activityTemplate?.co2Factor || 0)).toFixed(2);
    };

    // Calculate estimated CO2 for current form
    const currentQuantity = Number(quantityText) || 0;
    const estimatedCo2 = selectedTemplate
        ? (currentQuantity * selectedTemplate.co2Factor).toFixed(2)
        : '0.00';

    return (
        <Box>
            <PageHeader
                title="Entries"
                description="Track your daily carbon-emitting activities"
                action={{
                    label: 'Add Entry',
                    onClick: handleAddEntry,
                    icon: <AddIcon />,
                    disabled: templates.length === 0,
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Loading variant="table" count={5} />
            ) : entries.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<ListAltOutlined sx={{ fontSize: 40 }} />}
                        title="No entries yet"
                        description="Start tracking your carbon footprint by adding your first activity entry."
                        action={
                            templates.length > 0
                                ? {
                                    label: 'Add your first entry',
                                    onClick: handleAddEntry,
                                }
                                : undefined
                        }
                    />
                </Card>
            ) : (
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Activity</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">CO₂ Impact</TableCell>
                                    <TableCell>Note</TableCell>
                                    <TableCell align="right" sx={{ width: 100 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {entries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            <Chip
                                                label={entry.date}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'grey.100',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ fontWeight: 500 }}>
                                                {entry.activityTemplate?.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            {entry.quantity} {entry.activityTemplate?.defaultUnit}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={`${calculateCo2(entry)} kg`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {entry.note || '—'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditEntry(entry)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setDeleteDialog({ open: true, id: entry.id })}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {/* Template Picker */}
            <TemplatePicker
                open={pickerOpen}
                templates={templates}
                onSelect={handleTemplateSelect}
                onClose={() => setPickerOpen(false)}
            />

            {/* Entry Form Dialog */}
            <FormDialog
                open={openDialog}
                title={editingEntry ? 'Edit Entry' : 'Log Activity'}
                onSubmit={handleSubmit}
                onCancel={handleCloseDialog}
                submitLabel={editingEntry ? 'Update' : 'Log Entry'}
            >
                {/* Selected Template Display */}
                {selectedTemplate && (
                    <Box
                        sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 2,
                            backgroundColor: alpha('#16A34A', 0.05),
                            border: '1px solid',
                            borderColor: alpha('#16A34A', 0.2),
                        }}
                    >
                        <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            {selectedTemplate.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Co2Outlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                {selectedTemplate.co2Factor} kg CO₂ per {selectedTemplate.defaultUnit}
                            </Typography>
                        </Box>
                        {!editingEntry && (
                            <Button
                                size="small"
                                onClick={() => {
                                    setOpenDialog(false);
                                    setPickerOpen(true);
                                }}
                                sx={{ mt: 1, fontSize: 12 }}
                            >
                                Change activity
                            </Button>
                        )}
                    </Box>
                )}

                <TextField
                    fullWidth
                    label={`Quantity (${selectedTemplate?.defaultUnit || 'units'})`}
                    type="text"
                    inputMode="decimal"
                    value={quantityText}
                    onChange={(e) => {
                        // Allow empty string, digits, and decimal point
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setQuantityText(value);
                            setQuantityError('');
                        }
                    }}
                    error={!!quantityError}
                    sx={{ mb: 2 }}
                    placeholder="Enter quantity"
                    helperText={quantityError || `Estimated CO₂: ${estimatedCo2} kg`}
                />
                <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Note (optional)"
                    multiline
                    rows={2}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="e.g., Trip to work, Weekly groceries..."
                />
            </FormDialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                title="Delete Entry"
                message="Are you sure you want to delete this entry? This action cannot be undone."
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
