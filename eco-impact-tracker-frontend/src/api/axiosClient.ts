import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info';

// Dev logging helper
const shouldLog = () => import.meta.env.DEV && LOG_LEVEL !== 'silent';
const logApi = (message: string) => {
    if (shouldLog()) {
        console.log(`[API] ${message}`);
    }
};

const axiosClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authorization header
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Store start time for duration logging
        (config as unknown as { metadata: { startTime: number } }).metadata = { startTime: Date.now() };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors and logging
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log successful requests in dev mode
        const { config } = response;
        const duration = Date.now() - ((config as unknown as { metadata: { startTime: number } }).metadata?.startTime || Date.now());
        const path = config.url?.replace(API_BASE_URL, '') || config.url;
        logApi(`${config.method?.toUpperCase()} ${path} -> ${response.status} (${duration}ms)`);
        return response;
    },
    (error) => {
        const { config, response } = error;
        if (config) {
            const duration = Date.now() - ((config as unknown as { metadata: { startTime: number } }).metadata?.startTime || Date.now());
            const path = config.url?.replace(API_BASE_URL, '') || config.url;
            const status = response?.status || 'ERR';
            const message = response?.data?.message || response?.data?.error || error.message;
            logApi(`${config.method?.toUpperCase()} ${path} -> ${status} (${duration}ms) ${message}`);
        }

        if (response?.status === 401) {
            // Token invalid or expired, clear storage and redirect to login
            tokenStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;

