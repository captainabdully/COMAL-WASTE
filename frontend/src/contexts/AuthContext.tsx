import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    token: string | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    user: any | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    login: () => { },
    logout: () => { },
    user: null,
    isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<any | null>(JSON.parse(localStorage.getItem('user') || 'null'));

    useEffect(() => {
        // Optional: Validate token validity here
    }, []);

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
        <AuthContext.Provider value={{ token, login, logout, user, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
