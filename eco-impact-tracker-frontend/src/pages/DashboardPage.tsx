import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    IconButton,
    Tooltip,
    alpha,
} from '@mui/material';
import {
    RefreshOutlined,
    Co2Outlined,
    ArticleOutlined,
    TrendingDown,
    CalendarTodayOutlined,
} from '@mui/icons-material';
import { format, startOfMonth } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { statsApi } from '../api/statsApi';
import type { StatsSummary, StatsByDay, StatsByType } from '../api/statsApi';
import { Loading } from '../components/Loading';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';

const CHART_COLORS = ['#16A34A', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Enriched pie data with percentage
interface PieDataWithPct {
    activityTypeName: string;
    totalCo2: number;
    pct: number;
    [key: string]: string | number; // Index signature for Recharts
}

// Custom Pie Tooltip: "Transport — 708.81 kg • 42.3%"
interface PieTooltipPayload {
    payload: PieDataWithPct;
}

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: PieTooltipPayload[] }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    if (!data) return null;

    return (
        <Box
            sx={{
                backgroundColor: 'white',
                p: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography variant="body2" fontWeight={500}>
                {data.activityTypeName} — {data.totalCo2.toFixed(2)} kg • {data.pct.toFixed(1)}%
            </Typography>
        </Box>
    );
};

// Custom Pie Legend: colored dot + name + percentage
interface PieLegendProps {
    payload?: Array<{
        value: string;
        color: string;
        payload: PieDataWithPct;
    }>;
}

const PieLegend: React.FC<PieLegendProps> = ({ payload }) => {
    if (!payload || payload.length === 0) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                mt: 1,
            }}
        >
            {payload.map((entry, index) => (
                <Box
                    key={`legend-${index}`}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: entry.color,
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: 12 }}
                    >
                        {entry.value}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.primary', fontWeight: 500, fontSize: 12 }}
                    >
                        {entry.payload.pct.toFixed(1)}%
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export const DashboardPage: React.FC = () => {
    const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [summary, setSummary] = useState<StatsSummary | null>(null);
    const [byDay, setByDay] = useState<StatsByDay[]>([]);
    const [byType, setByType] = useState<StatsByType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [summaryData, byDayData, byTypeData] = await Promise.all([
                statsApi.getSummary(fromDate, toDate),
                statsApi.getByDay(fromDate, toDate),
                statsApi.getByType(fromDate, toDate),
            ]);
            setSummary(summaryData);
            setByDay(byDayData);
            setByType(byTypeData);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Enrich pie data with percentages
    const pieDataWithPct: PieDataWithPct[] = useMemo(() => {
        const total = byType.reduce((sum, item) => sum + (item.totalCo2 || 0), 0);
        return byType.map((item) => ({
            activityTypeName: item.activityTypeName,
            totalCo2: item.totalCo2 || 0,
            pct: total > 0 ? ((item.totalCo2 || 0) / total) * 100 : 0,
        }));
    }, [byType]);

    // Line chart tooltip
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        backgroundColor: 'white',
                        p: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {payload[0].value.toFixed(2)} kg CO₂
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Box>
            <PageHeader
                title="Dashboard"
                description="Monitor your environmental impact and track progress"
            />

            {/* Date Filter Card */}
            <Card sx={{ mb: 4 }}>
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
                        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
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
                        <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
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
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '&:disabled': {
                                        backgroundColor: 'grey.300',
                                    },
                                }}
                            >
                                <RefreshOutlined />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>

            {error && (
                <Card sx={{ mb: 3, backgroundColor: alpha('#EF4444', 0.05), borderColor: alpha('#EF4444', 0.2) }}>
                    <CardContent sx={{ py: 2 }}>
                        <Typography color="error">{error}</Typography>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Loading variant="cards" count={2} />
            ) : (
                <>
                    {/* KPI Cards */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: 3,
                            mb: 4,
                        }}
                    >
                        <StatCard
                            title="Total CO₂ Emissions"
                            value={`${summary?.totalCo2?.toFixed(1) || 0} kg`}
                            subtitle="This period"
                            icon={<Co2Outlined sx={{ fontSize: 28 }} />}
                            color="primary"
                        />
                        <StatCard
                            title="Logged Entries"
                            value={summary?.entryCount || 0}
                            subtitle="Activities tracked"
                            icon={<ArticleOutlined sx={{ fontSize: 28 }} />}
                            color="secondary"
                        />
                        <StatCard
                            title="Daily Average"
                            value={`${byDay.length > 0 ? ((summary?.totalCo2 || 0) / byDay.length).toFixed(1) : 0} kg`}
                            subtitle="CO₂ per day"
                            icon={<TrendingDown sx={{ fontSize: 28 }} />}
                            color="success"
                        />
                    </Box>

                    {/* Charts */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' },
                            gap: 3,
                        }}
                    >
                        {/* Line Chart */}
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 3,
                                        color: 'text.primary',
                                    }}
                                >
                                    Emissions Over Time
                                </Typography>
                                {byDay.length > 0 ? (
                                    <Box sx={{ height: 320 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={byDay}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12, fill: '#6E6E73' }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#E5E5EA' }}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12, fill: '#6E6E73' }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#E5E5EA' }}
                                                    tickFormatter={(value) => `${value}`}
                                                />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="totalCo2"
                                                    stroke="#16A34A"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#16A34A', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <EmptyState
                                        title="No data yet"
                                        description="Start logging activities to see your emissions trend"
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Pie Chart */}
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 3,
                                        color: 'text.primary',
                                    }}
                                >
                                    By Activity Type
                                </Typography>
                                {byType.length > 0 ? (
                                    <Box sx={{ height: 320 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieDataWithPct}
                                                    dataKey="totalCo2"
                                                    nameKey="activityTypeName"
                                                    cx="50%"
                                                    cy="45%"
                                                    outerRadius={90}
                                                    innerRadius={50}
                                                    paddingAngle={3}
                                                    cornerRadius={4}
                                                >
                                                    {pieDataWithPct.map((_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip content={<PieTooltip />} />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    content={<PieLegend />}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <EmptyState
                                        title="No data yet"
                                        description="Log activities to see breakdown by type"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                </>
            )}
        </Box>
    );
};
