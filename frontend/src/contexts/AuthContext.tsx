import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AuthContextType {
    token: string | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    user: any | null;
    isAuthenticated: boolean;
    can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    login: () => { },
    logout: () => { },
    user: null,
    isAuthenticated: false,
    can: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<any | null>(JSON.parse(localStorage.getItem('user') || 'null'));

    // Sessions created before permissions existed (or after a role edit) have stale data: refresh it from the server.
    useEffect(() => {
        if (!token) return;
        api.get('/auth/me')
            .then((res) => {
                setUser((prev: any) => {
                    const next = { ...(prev || {}), roles: res.data.roles, permissions: res.data.permissions };
                    localStorage.setItem('user', JSON.stringify(next));
                    return next;
                });
            })
            .catch(() => { /* 401 is handled by the api interceptor */ });
    }, [token]);

    const can = useCallback((permission: string) => {
        if (Array.isArray(user?.permissions)) return user.permissions.includes(permission);
        // Old session, /auth/me not answered yet: admins keep working instead of seeing an empty menu.
        return !!user?.roles?.includes('admin');
    }, [user]);

    const login = (newToken: string, newUser: any) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, user, isAuthenticated: !!token, can }}>
            {children}
        </AuthContext.Provider>
    );
};
