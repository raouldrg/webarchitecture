import axiosClient from './axiosClient';

export interface Goal {
    id: number;
    period: 'DAY' | 'WEEK' | 'MONTH';
    targetCo2: number;
    startDate: string;
    endDate: string;
}

export interface GoalRequest {
    period: 'DAY' | 'WEEK' | 'MONTH';
    targetCo2: number;
    startDate: string;
    endDate: string;
}

export const goalsApi = {
    getAll: async (): Promise<Goal[]> => {
        const response = await axiosClient.get<Goal[]>('/goals');
        return response.data;
    },

    getById: async (id: number): Promise<Goal> => {
        const response = await axiosClient.get<Goal>(`/goals/${id}`);
        return response.data;
    },

    create: async (data: GoalRequest): Promise<Goal> => {
        const response = await axiosClient.post<Goal>('/goals', data);
        return response.data;
    },

    update: async (id: number, data: GoalRequest): Promise<Goal> => {
        const response = await axiosClient.put<Goal>(`/goals/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/goals/${id}`);
    },
};
