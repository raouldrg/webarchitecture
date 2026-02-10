import axiosClient from './axiosClient';

export interface StatsSummary {
    periodStart: string;
    periodEnd: string;
    totalCo2: number;
    entryCount: number;
}

export interface StatsByDay {
    date: string;
    totalCo2: number;
}

export interface StatsByType {
    activityTypeName: string;
    totalCo2: number;
}

export const statsApi = {
    getSummary: async (from: string, to: string): Promise<StatsSummary> => {
        const response = await axiosClient.get<StatsSummary>('/stats/summary', {
            params: { from, to },
        });
        return response.data;
    },

    getByDay: async (from: string, to: string): Promise<StatsByDay[]> => {
        const response = await axiosClient.get<StatsByDay[]>('/stats/by-day', {
            params: { from, to },
        });
        return response.data;
    },

    getByType: async (from: string, to: string): Promise<StatsByType[]> => {
        const response = await axiosClient.get<StatsByType[]>('/stats/by-type', {
            params: { from, to },
        });
        return response.data;
    },
};
