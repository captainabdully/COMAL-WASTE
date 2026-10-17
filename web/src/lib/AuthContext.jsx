import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, session, setUnauthorizedHandler } from './api';
import { useUI } from '../components/UI';

const AuthContext = createContext(null);

const snapshot = () => {
  const token = session.get('authToken');
  if (!token) return null;
  const roles = session.roles();
  // Staff accounts belong to the admin dashboard, never to this app.
  if (roles.includes('admin') || roles.includes('manager')) { session.clear(); return null; }
  return {
    token,
    id: session.get('userId'),
    email: session.get('userEmail') || '',
    name: session.get('userName') || '',
    roles,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(snapshot);
  const navigate = useNavigate();
  const ui = useUI();

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
    navigate('/sign-in', { replace: true });
  }, [navigate]);

  // Same behaviour as the mobile axios interceptor: a 401 ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      session.clear();
      setUser(null);
      ui.toast({ type: 'error', title: 'Session Expired', text: 'Your session has timed out. Please log in again.' });
      navigate('/sign-in', { replace: true });
    });
  }, [navigate, ui]);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    if (!res?.token) return false;
    const roles = res.user?.roles || [];
    if (roles.includes('admin') || roles.includes('manager')) {
      throw new Error('Admin accounts cannot sign in here. Please use the admin dashboard.');
    }
    session.set('authToken', res.token);
    if (res.refreshToken) session.set('refreshToken', res.refreshToken);
    session.set('userId', String(res.user?.user_id));
    session.set('userEmail', res.user?.email || email);
    session.set('userName', res.user?.name || 'User');
    session.set('userRoles', JSON.stringify(roles));
    setUser(snapshot());
    return true;
  }, []);

  const updateProfile = useCallback(({ email, name }) => {
    if (email) session.set('userEmail', email);
    if (name) session.set('userName', name);
    setUser(snapshot());
  }, []);

  const value = useMemo(() => ({ user, login, logout, updateProfile }), [user, login, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
