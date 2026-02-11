import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import type { AuthResponse } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';

interface AuthContextType {
    user: AuthResponse | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user  is already logged in
        const token = tokenStorage.getToken();
        const storedUser = tokenStorage.getUser();
        if (token && storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        tokenStorage.setToken(response.token);
        tokenStorage.setUser(response);
        setUser(response);
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await authApi.register({ name, email, password });
        tokenStorage.setToken(response.token);
        tokenStorage.setUser(response);
        setUser(response);
    };

    const logout = () => {
        tokenStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
