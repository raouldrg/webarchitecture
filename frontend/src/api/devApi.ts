import axiosClient from './axiosClient';

export interface GenerateUserDataParams {
    daysBack?: number;
    entriesPerDayMin?: number;
    entriesPerDayMax?: number;
    includeGoals?: boolean;
    overwriteInRange?: boolean;
}

export interface GenerateUserDataResult {
    createdEntries: number;
    createdGoals: number;
    rangeStart: string;
    rangeEnd: string;
}

export const devApi = {
    generateUserData: async (params: GenerateUserDataParams): Promise<GenerateUserDataResult> => {
        const response = await axiosClient.post<GenerateUserDataResult>('/dev/generate-user-data', params);
        return response.data;
    },
};
