import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    IconButton,
    Tooltip,
    Button,
    Typography,
    Chip,
    alpha,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    FileDownloadOutlined,
    RefreshOutlined,
    CalendarTodayOutlined,
    Co2Outlined,
    ArticleOutlined,
    CategoryOutlined,
} from '@mui/icons-material';
import {
    DataGrid,
    useGridApiRef,
    gridFilteredSortedRowIdsSelector,
    GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import type { GridColDef, GridRowId, GridFilterModel, GridSlots } from '@mui/x-data-grid';
import { format, startOfMonth } from 'date-fns';
import { entriesApi } from '../api/entriesApi';
import type { Entry } from '../api/entriesApi';
import { templatesApi } from '../api/templatesApi';
import type { ActivityTemplate } from '../api/templatesApi';
import { activityTypesApi } from '../api/activityTypesApi';
import type { ActivityType } from '../api/activityTypesApi';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

// Enriched row type for the DataGrid
interface ExportRow {
    id: number;
    date: string;
    activityName: string;
    typeName: string;
    quantity: number;
    unit: string;
    co2Kg: number;
    source: string;
    note: string;
}

// Custom toolbar with quick filter
function CustomToolbar() {
    return (
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', maxWidth: 300 }}>
            <GridToolbarQuickFilter debounceMs={200} />
        </Box>
    );
}

export const ExportPage: React.FC = () => {
    const apiRef = useGridApiRef();

    // Date range state
    const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Data state
    const [entries, setEntries] = useState<Entry[]>([]);
    const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter state
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    // Fetch all data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [entriesData, templatesData, typesData] = await Promise.all([
                entriesApi.getByDateRange(fromDate, toDate),
                templatesApi.getAll(),
                activityTypesApi.getAll(),
            ]);
            setEntries(entriesData);
            setTemplates(templatesData);
            setActivityTypes(typesData);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Build template lookup map
    const templateMap = useMemo(() => {
        const map = new Map<number, ActivityTemplate>();
        templates.forEach((t) => map.set(t.id, t));
        return map;
    }, [templates]);

    // Build type lookup map
    const typeMap = useMemo(() => {
        const map = new Map<number, ActivityType>();
        activityTypes.forEach((t) => map.set(t.id, t));
        return map;
    }, [activityTypes]);

    // Transform entries to enriched rows
    const allRows: ExportRow[] = useMemo(() => {
        return entries.map((entry) => {
            // Get full template from lookup (includes activityType and source)
            const fullTemplate = entry.activityTemplate
                ? templateMap.get(entry.activityTemplate.id)
                : null;
            // Fall back to entry's embedded template for basic fields
            const template = fullTemplate || entry.activityTemplate;
            // Get type from full template
            const type = fullTemplate?.activityType
                ? typeMap.get(fullTemplate.activityType.id) || fullTemplate.activityType
                : null;

            return {
                id: entry.id,
                date: entry.date,
                activityName: template?.name || 'Unknown',
                typeName: type?.name || 'Unknown',
                quantity: entry.quantity,
                unit: template?.defaultUnit || '',
                co2Kg: entry.quantity * (template?.co2Factor || 0),
                source: fullTemplate?.source || '',
                note: entry.note || '',
            };
        });
    }, [entries, templateMap, typeMap]);

    // Filter rows by selected type
    const rows = useMemo(() => {
        if (!selectedType) return allRows;
        return allRows.filter((row) => row.typeName === selectedType);
    }, [allRows, selectedType]);

    // Get unique type names for chips
    const uniqueTypes = useMemo(() => {
        const typeSet = new Set<string>();
        allRows.forEach((row) => {
            if (row.typeName && row.typeName !== 'Unknown') {
                typeSet.add(row.typeName);
            }
        });
        return Array.from(typeSet).sort();
    }, [allRows]);

    // Get filtered row IDs from DataGrid
    const getFilteredRowIds = useCallback((): GridRowId[] => {
        if (!apiRef.current) return rows.map((r) => r.id);
        return gridFilteredSortedRowIdsSelector(apiRef) as GridRowId[];
    }, [apiRef, rows]);

    // Calculate summary based on filtered rows
    const summary = useMemo(() => {
        const filteredIds = new Set(getFilteredRowIds());
        const filteredRows = rows.filter((r) => filteredIds.has(r.id));

        const totalCo2 = filteredRows.reduce((sum, row) => sum + row.co2Kg, 0);
        const entryCount = filteredRows.length;

        // Calculate breakdown by type
        const byType = new Map<string, number>();
        filteredRows.forEach((row) => {
            const current = byType.get(row.typeName) || 0;
            byType.set(row.typeName, current + row.co2Kg);
        });

        // Sort and get top 3
        const sortedTypes = Array.from(byType.entries())
            .sort((a, b) => b[1] - a[1]);
        const topTypes = sortedTypes.slice(0, 3);
        const othersTotal = sortedTypes.slice(3).reduce((sum, [, val]) => sum + val, 0);

        return {
            totalCo2,
            entryCount,
            topTypes,
            othersTotal,
        };
    }, [rows, getFilteredRowIds]);

    // Column definitions
    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: 'date',
                headerName: 'Date',
                width: 120,
                valueFormatter: (value: string) => {
                    try {
                        return format(new Date(value), 'dd/MM/yyyy');
                    } catch {
                        return value;
                    }
                },
            },
            {
                field: 'activityName',
                headerName: 'Activity',
                flex: 1,
                minWidth: 150,
            },
            {
                field: 'typeName',
                headerName: 'Category',
                width: 130,
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
                width: 100,
                type: 'number',
                align: 'right',
                headerAlign: 'right',
            },
            {
                field: 'unit',
                headerName: 'Unit',
                width: 80,
            },
            {
                field: 'co2Kg',
                headerName: 'CO₂ (kg)',
                width: 110,
                type: 'number',
                align: 'right',
                headerAlign: 'right',
                valueFormatter: (value: number) => value.toFixed(2),
            },
            {
                field: 'source',
                headerName: 'Source',
                width: 120,
            },
            {
                field: 'note',
                headerName: 'Note',
                flex: 1,
                minWidth: 150,
            },
        ],
        []
    );

    // Export CSV
    const handleExportCSV = useCallback(() => {
        const filteredIds = new Set(getFilteredRowIds());
        const filteredRows = rows.filter((r) => filteredIds.has(r.id));

        if (filteredRows.length === 0) {
            return;
        }

        // Build CSV content
        const headers = ['Date', 'Activity', 'Category', 'Quantity', 'Unit', 'CO2 (kg)', 'Source', 'Note'];
        const csvRows = [
            headers.join(','),
            ...filteredRows.map((row) =>
                [
                    row.date,
                    `"${row.activityName.replace(/"/g, '""')}"`,
                    `"${row.typeName.replace(/"/g, '""')}"`,
                    row.quantity,
                    row.unit,
                    row.co2Kg.toFixed(2),
                    `"${row.source.replace(/"/g, '""')}"`,
                    `"${row.note.replace(/"/g, '""')}"`,
                ].join(',')
            ),
        ];

        const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `eco-tracker-export_${fromDate}_to_${toDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [rows, getFilteredRowIds, fromDate, toDate]);

    return (
        <Box>
            <PageHeader
                title="Export"
                description="Download and review your activity history"
            />

            {/* Date Range & Actions */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ py: 2.5 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            alignItems: 'center',
                        }}
                    >
                        <CalendarTodayOutlined sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />
                        <Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="From"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="To"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <Tooltip title="Refresh data">
                            <IconButton
                                onClick={fetchData}
                                disabled={loading}
                                sx={{
                                    backgroundColor: 'grey.100',
                                    '&:hover': { backgroundColor: 'grey.200' },
                                }}
                            >
                                <RefreshOutlined />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadOutlined />}
                            onClick={handleExportCSV}
                            disabled={loading || rows.length === 0}
                            sx={{ ml: 'auto' }}
                        >
                            Export CSV
                        </Button>
                    </Box>

                    {/* Category Filter Chips */}
                    {uniqueTypes.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label="All"
                                variant={selectedType === null ? 'filled' : 'outlined'}
                                color={selectedType === null ? 'primary' : 'default'}
                                onClick={() => setSelectedType(null)}
                                size="small"
                            />
                            {uniqueTypes.map((type) => (
                                <Chip
                                    key={type}
                                    label={type}
                                    variant={selectedType === type ? 'filled' : 'outlined'}
                                    color={selectedType === type ? 'primary' : 'default'}
                                    onClick={() => setSelectedType(type === selectedType ? null : type)}
                                    size="small"
                                />
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Summary Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 3,
                    mb: 3,
                }}
            >
                <StatCard
                    title="Total CO₂"
                    value={`${summary.totalCo2.toFixed(1)} kg`}
                    subtitle="Filtered entries"
                    icon={<Co2Outlined sx={{ fontSize: 28 }} />}
                    color="primary"
                />
                <StatCard
                    title="Entry Count"
                    value={summary.entryCount}
                    subtitle="Matching filters"
                    icon={<ArticleOutlined sx={{ fontSize: 28 }} />}
                    color="secondary"
                />
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: alpha('#F59E0B', 0.1),
                                    color: '#F59E0B',
                                }}
                            >
                                <CategoryOutlined sx={{ fontSize: 24 }} />
                            </Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Top Categories
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                            {summary.topTypes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No data
                                </Typography>
                            ) : (
                                <>
                                    {summary.topTypes.map(([name, co2]) => (
                                        <Box
                                            key={name}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                py: 0.25,
                                            }}
                                        >
                                            <Typography variant="body2">{name}</Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {co2.toFixed(1)} kg
                                            </Typography>
                                        </Box>
                                    ))}
                                    {summary.othersTotal > 0 && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                py: 0.25,
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                Others
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {summary.othersTotal.toFixed(1)} kg
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* DataGrid */}
            <Card>
                <Box sx={{ height: 500 }}>
                    {loading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <DataGrid
                            apiRef={apiRef}
                            rows={rows}
                            columns={columns}
                            filterModel={filterModel}
                            onFilterModelChange={setFilterModel}
                            pageSizeOptions={[10, 25, 50, 100]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 25 } },
                                sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
                            }}
                            slots={{
                                toolbar: CustomToolbar as GridSlots['toolbar'],
                            }}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderColor: 'divider',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'grey.50',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                },
                            }}
                        />
                    )}
                </Box>
            </Card>
        </Box>
    );
};
