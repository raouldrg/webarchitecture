// Token storage utilities
const TOKEN_KEY = 'eco_tracker_token';
const USER_KEY = 'eco_tracker_user';

export const tokenStorage = {
    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string): void => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: (): void => {
        localStorage.removeItem(TOKEN_KEY);
    },

    getUser: (): any | null => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser: (user: any): void => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    removeUser: (): void => {
        localStorage.removeItem(USER_KEY);
    },

    clear: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
