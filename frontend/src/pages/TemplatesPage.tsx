import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
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
    InputAdornment,
    Typography,
    alpha,
} from '@mui/material';
import {
    DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon,
    Add as AddIcon,
    DescriptionOutlined,
    SearchOutlined,
} from '@mui/icons-material';
import { templatesApi } from '../api/templatesApi';
import type { ActivityTemplate, ActivityTemplateRequest } from '../api/templatesApi';
import { activityTypesApi } from '../api/activityTypesApi';
import type { ActivityType } from '../api/activityTypesApi';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormDialog } from '../components/FormDialog';

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        'Transport': '#3B82F6',
        'Énergie': '#F59E0B',
        'Alimentation': '#10B981',
        'Achats': '#8B5CF6',
        'Numérique': '#6366F1',
        'Déchets': '#6B7280',
        'Logement': '#EC4899',
        'Services': '#14B8A6',
    };
    return colors[category] || '#6B7280';
};

export const TemplatesPage: React.FC = () => {
    const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
        open: false,
        id: null,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Search and filter state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [formData, setFormData] = useState<ActivityTemplateRequest>({
        name: '',
        defaultUnit: '',
        co2Factor: 0,
        source: '',
        activityTypeId: 0,
    });

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [templatesData, typesData] = await Promise.all([
                templatesApi.getAll(),
                activityTypesApi.getAll(),
            ]);
            setTemplates(templatesData);
            setActivityTypes(typesData);
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

    // Get unique categories from templates
    const categories = useMemo(() => {
        const cats = new Set<string>();
        templates.forEach(t => {
            if (t.activityType?.name) cats.add(t.activityType.name);
        });
        return Array.from(cats).sort();
    }, [templates]);

    // Filter templates
    const filteredTemplates = useMemo(() => {
        let result = templates;

        if (selectedCategory) {
            result = result.filter(t => t.activityType?.name === selectedCategory);
        }

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(searchLower) ||
                t.activityType?.name.toLowerCase().includes(searchLower) ||
                t.source?.toLowerCase().includes(searchLower)
            );
        }

        return result;
    }, [templates, search, selectedCategory]);

    const handleOpenDialog = (template?: ActivityTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                name: template.name,
                defaultUnit: template.defaultUnit,
                co2Factor: template.co2Factor,
                source: template.source || '',
                activityTypeId: template.activityType?.id || 0,
            });
        } else {
            setEditingTemplate(null);
            setFormData({
                name: '',
                defaultUnit: '',
                co2Factor: 0,
                source: '',
                activityTypeId: activityTypes[0]?.id || 0,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingTemplate(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingTemplate) {
                await templatesApi.update(editingTemplate.id, formData);
                setSnackbar({ open: true, message: 'Template updated successfully', severity: 'success' });
            } else {
                await templatesApi.create(formData);
                setSnackbar({ open: true, message: 'Template created successfully', severity: 'success' });
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
                await templatesApi.delete(deleteDialog.id);
                setSnackbar({ open: true, message: 'Template deleted successfully', severity: 'success' });
                fetchData();
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                setSnackbar({ open: true, message: error.response?.data?.message || 'Delete failed', severity: 'error' });
            }
        }
        setDeleteDialog({ open: false, id: null });
    };

    return (
        <Box>
            <PageHeader
                title="Activity Templates"
                description={`${templates.length} templates available • Manage your activity catalog`}
                action={{
                    label: 'Add Template',
                    onClick: () => handleOpenDialog(),
                    icon: <AddIcon />,
                    disabled: activityTypes.length === 0,
                }}
            />

            {activityTypes.length === 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Please create an Activity Type first before creating templates.
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Loading variant="table" count={5} />
            ) : templates.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<DescriptionOutlined sx={{ fontSize: 40 }} />}
                        title="No templates yet"
                        description="Create activity templates to start tracking your carbon footprint."
                        action={
                            activityTypes.length > 0
                                ? {
                                    label: 'Create your first template',
                                    onClick: () => handleOpenDialog(),
                                }
                                : undefined
                        }
                    />
                </Card>
            ) : (
                <>
                    {/* Search and Filters */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    size="small"
                                    placeholder="Search templates..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    sx={{ width: 280 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`All (${templates.length})`}
                                        size="small"
                                        onClick={() => setSelectedCategory(null)}
                                        sx={{
                                            backgroundColor: !selectedCategory ? 'primary.main' : 'grey.100',
                                            color: !selectedCategory ? 'white' : 'text.primary',
                                            fontWeight: 500,
                                        }}
                                    />
                                    {categories.map(cat => {
                                        const count = templates.filter(t => t.activityType?.name === cat).length;
                                        return (
                                            <Chip
                                                key={cat}
                                                label={`${cat} (${count})`}
                                                size="small"
                                                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                                sx={{
                                                    backgroundColor: selectedCategory === cat
                                                        ? getCategoryColor(cat)
                                                        : alpha(getCategoryColor(cat), 0.1),
                                                    color: selectedCategory === cat ? 'white' : getCategoryColor(cat),
                                                    fontWeight: 500,
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Results info */}
                    {(search || selectedCategory) && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Showing {filteredTemplates.length} of {templates.length} templates
                            {selectedCategory && ` in "${selectedCategory}"`}
                            {search && ` matching "${search}"`}
                        </Typography>
                    )}

                    {/* Templates Table */}
                    <Card>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell align="right">CO₂ Factor</TableCell>
                                        <TableCell>Source</TableCell>
                                        <TableCell align="right" sx={{ width: 100 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTemplates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                                    <Typography color="text.secondary">
                                                        No templates found matching your criteria
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTemplates.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell>
                                                    <Box sx={{ fontWeight: 500 }}>
                                                        {template.name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={template.activityType?.name}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: alpha(
                                                                getCategoryColor(template.activityType?.name || ''),
                                                                0.1
                                                            ),
                                                            color: getCategoryColor(template.activityType?.name || ''),
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{template.defaultUnit}</TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={`${template.co2Factor} kg`}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {template.source || '—'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenDialog(template)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setDeleteDialog({ open: true, id: template.id })}
                                                                sx={{ color: 'error.main' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </>
            )}

            {/* Form Dialog */}
            <FormDialog
                open={openDialog}
                title={editingTemplate ? 'Edit Template' : 'Add Template'}
                onSubmit={handleSubmit}
                onCancel={handleCloseDialog}
                submitLabel={editingTemplate ? 'Update' : 'Create'}
            >
                <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    sx={{ mb: 2 }}
                />
                <TextField
                    select
                    fullWidth
                    label="Activity Type"
                    value={formData.activityTypeId}
                    onChange={(e) =>
                        setFormData({ ...formData, activityTypeId: Number(e.target.value) })
                    }
                    sx={{ mb: 2 }}
                >
                    {activityTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                            {type.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Default Unit"
                    placeholder="e.g., km, kWh, kg"
                    value={formData.defaultUnit}
                    onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="CO₂ Factor (kg per unit)"
                    type="number"
                    value={formData.co2Factor}
                    onChange={(e) => setFormData({ ...formData, co2Factor: Number(e.target.value) })}
                    helperText="Amount of CO₂ emitted per unit of this activity"
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Source (optional)"
                    placeholder="e.g., ADEME Base Carbone 2023"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
            </FormDialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                title="Delete Template"
                message="Are you sure you want to delete this template? Entries using this template will be affected."
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
