import axiosClient from './axiosClient';

export interface Entry {
    id: number;
    quantity: number;
    date: string;
    note?: string;
    activityTemplate?: {
        id: number;
        name: string;
        co2Factor: number;
        defaultUnit: string;
    };
}

export interface EntryRequest {
    quantity: number;
    date: string;
    note?: string;
    activityTemplateId: number;
}

export const entriesApi = {
    getAll: async (): Promise<Entry[]> => {
        const response = await axiosClient.get<Entry[]>('/entries');
        return response.data;
    },

    getById: async (id: number): Promise<Entry> => {
        const response = await axiosClient.get<Entry>(`/entries/${id}`);
        return response.data;
    },

    getByDateRange: async (from: string, to: string): Promise<Entry[]> => {
        const response = await axiosClient.get<Entry[]>(`/entries/range`, {
            params: { from, to },
        });
        return response.data;
    },

    create: async (data: EntryRequest): Promise<Entry> => {
        const response = await axiosClient.post<Entry>('/entries', data);
        return response.data;
    },

    update: async (id: number, data: EntryRequest): Promise<Entry> => {
        const response = await axiosClient.put<Entry>(`/entries/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/entries/${id}`);
    },
};
