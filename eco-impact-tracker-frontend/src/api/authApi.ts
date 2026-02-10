import axiosClient from './axiosClient';

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
};

export type AuthRequest = {
    email: string;
    password: string;
};

export type AuthResponse = {
    token: string;
    email: string;
    name: string;
    userId: number;
};

export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: AuthRequest): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },
};
