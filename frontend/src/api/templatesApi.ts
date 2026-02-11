import axiosClient from './axiosClient';

export interface ActivityTemplate {
    id: number;
    name: string;
    defaultUnit: string;
    co2Factor: number;
    source?: string;
    activityType?: {
        id: number;
        name: string;
    };
}

export interface ActivityTemplateRequest {
    name: string;
    defaultUnit: string;
    co2Factor: number;
    source?: string;
    activityTypeId: number;
}

export const templatesApi = {
    getAll: async (): Promise<ActivityTemplate[]> => {
        const response = await axiosClient.get<ActivityTemplate[]>('/activity-templates');
        return response.data;
    },

    getById: async (id: number): Promise<ActivityTemplate> => {
        const response = await axiosClient.get<ActivityTemplate>(`/activity-templates/${id}`);
        return response.data;
    },

    getByType: async (activityTypeId: number): Promise<ActivityTemplate[]> => {
        const response = await axiosClient.get<ActivityTemplate[]>(
            `/activity-templates/by-type/${activityTypeId}`
        );
        return response.data;
    },

    create: async (data: ActivityTemplateRequest): Promise<ActivityTemplate> => {
        const response = await axiosClient.post<ActivityTemplate>('/activity-templates', data);
        return response.data;
    },

    update: async (id: number, data: ActivityTemplateRequest): Promise<ActivityTemplate> => {
        const response = await axiosClient.put<ActivityTemplate>(`/activity-templates/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/activity-templates/${id}`);
    },
};
