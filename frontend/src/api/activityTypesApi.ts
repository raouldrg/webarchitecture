import axiosClient from './axiosClient';

export interface ActivityType {
    id: number;
    name: string;
    unit: string;
    description?: string;
}

export const activityTypesApi = {
    getAll: async (): Promise<ActivityType[]> => {
        const response = await axiosClient.get<ActivityType[]>('/activity-types');
        return response.data;
    },

    getById: async (id: number): Promise<ActivityType> => {
        const response = await axiosClient.get<ActivityType>(`/activity-types/${id}`);
        return response.data;
    },

    create: async (data: Omit<ActivityType, 'id'>): Promise<ActivityType> => {
        const response = await axiosClient.post<ActivityType>('/activity-types', data);
        return response.data;
    },

    update: async (id: number, data: Omit<ActivityType, 'id'>): Promise<ActivityType> => {
        const response = await axiosClient.put<ActivityType>(`/activity-types/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/activity-types/${id}`);
    },
};
