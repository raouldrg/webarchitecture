import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Chip,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Tooltip,
    alpha,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    Tabs,
    Tab,
} from '@mui/material';
import {
    SearchOutlined,
    StarOutlined,
    Star,
    AccessTimeOutlined,
    CloseOutlined,
    Co2Outlined,
} from '@mui/icons-material';
import type { ActivityTemplate } from '../api/templatesApi';
import { useDebouncedValue } from '../hooks';

interface TemplatePickerProps {
    open: boolean;
    templates: ActivityTemplate[];
    onSelect: (template: ActivityTemplate) => void;
    onClose: () => void;
}

const FAVORITES_KEY = 'eco_favorites';
const RECENTS_KEY = 'eco_recents';
const MAX_RECENTS = 10;

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
    open,
    templates,
    onSelect,
    onClose,
}) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [recents, setRecents] = useState<number[]>([]);
    const [tabValue, setTabValue] = useState(0);

    // Debounce search for 200ms, then defer the filtering
    const debouncedSearch = useDebouncedValue(search, 200);
    const deferredSearch = useDeferredValue(debouncedSearch);

    useEffect(() => {
        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        const savedRecents = localStorage.getItem(RECENTS_KEY);
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        if (savedRecents) setRecents(JSON.parse(savedRecents));
    }, []);

    useEffect(() => {
        if (open) {
            setSearch('');
            setTabValue(0);
        }
    }, [open]);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        templates.forEach(t => {
            if (t.activityType?.name) cats.add(t.activityType.name);
        });
        return Array.from(cats).sort();
    }, [templates]);

    // Use deferredSearch for filtering - keeps typing smooth
    const filteredTemplates = useMemo(() => {
        let result = templates;

        if (tabValue === 1) {
            result = result.filter(t => favorites.includes(t.id));
        } else if (tabValue === 2) {
            const recentSet = new Set(recents);
            result = result.filter(t => recentSet.has(t.id));
            result = result.sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));
        }

        if (selectedCategory) {
            result = result.filter(t => t.activityType?.name === selectedCategory);
        }

        if (deferredSearch.trim()) {
            const searchLower = deferredSearch.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(searchLower) ||
                t.activityType?.name.toLowerCase().includes(searchLower)
            );
        }

        return result;
    }, [templates, deferredSearch, selectedCategory, tabValue, favorites, recents]);

    const toggleFavorite = (e: React.MouseEvent, templateId: number) => {
        e.stopPropagation();
        const newFavorites = favorites.includes(templateId)
            ? favorites.filter(id => id !== templateId)
            : [...favorites, templateId];
        setFavorites(newFavorites);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    };

    const handleSelect = (template: ActivityTemplate) => {
        const newRecents = [template.id, ...recents.filter(id => id !== template.id)].slice(0, MAX_RECENTS);
        setRecents(newRecents);
        localStorage.setItem(RECENTS_KEY, JSON.stringify(newRecents));
        onSelect(template);
    };

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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '80vh',
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={600}>
                        Select Activity
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseOutlined />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ px: 3, pb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search activities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box sx={{ px: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => setTabValue(v)}
                        sx={{
                            minHeight: 40,
                            '& .MuiTab-root': { minHeight: 40, py: 0 },
                        }}
                    >
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    All
                                    <Chip label={templates.length} size="small" sx={{ height: 20, fontSize: 11 }} />
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <StarOutlined sx={{ fontSize: 16 }} />
                                    Favorites
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeOutlined sx={{ fontSize: 16 }} />
                                    Recent
                                </Box>
                            }
                        />
                    </Tabs>
                </Box>

                <Divider />

                {tabValue === 0 && (
                    <Box sx={{ px: 3, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label="All"
                            size="small"
                            onClick={() => setSelectedCategory(null)}
                            sx={{
                                backgroundColor: !selectedCategory ? 'primary.main' : 'grey.100',
                                color: !selectedCategory ? 'white' : 'text.primary',
                                fontWeight: 500,
                            }}
                        />
                        {categories.map(cat => (
                            <Chip
                                key={cat}
                                label={cat}
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
                        ))}
                    </Box>
                )}

                <List sx={{ maxHeight: 400, overflow: 'auto', py: 0 }}>
                    {filteredTemplates.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                {tabValue === 1 ? 'No favorites yet' :
                                    tabValue === 2 ? 'No recent activities' :
                                        'No activities found'}
                            </Typography>
                        </Box>
                    ) : (
                        filteredTemplates.map(template => (
                            <ListItemButton
                                key={template.id}
                                onClick={() => handleSelect(template)}
                                sx={{
                                    py: 1.5,
                                    px: 3,
                                    '&:hover': {
                                        backgroundColor: alpha('#16A34A', 0.04),
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography fontWeight={500}>
                                                {template.name}
                                            </Typography>
                                            <Chip
                                                label={template.activityType?.name}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: 10,
                                                    backgroundColor: alpha(
                                                        getCategoryColor(template.activityType?.name || ''),
                                                        0.1
                                                    ),
                                                    color: getCategoryColor(template.activityType?.name || ''),
                                                }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Co2Outlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {template.co2Factor} kg CO2 / {template.defaultUnit}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Tooltip title={favorites.includes(template.id) ? 'Remove from favorites' : 'Add to favorites'}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => toggleFavorite(e, template.id)}
                                            sx={{
                                                color: favorites.includes(template.id) ? 'warning.main' : 'text.secondary',
                                            }}
                                        >
                                            {favorites.includes(template.id) ? (
                                                <Star fontSize="small" />
                                            ) : (
                                                <StarOutlined fontSize="small" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItemButton>
                        ))
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
};
