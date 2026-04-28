import React, { createContext, useState, useCallback, useEffect } from 'react';
import client from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('admin_token');
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      client.get('/auth/me')
        .then((res) => {
          // Only allow ADMIN or MANAGER roles
          if (res.data?.role === 'ADMIN' || res.data?.role === 'MANAGER') {
            setUser(res.data);
            setIsAuthenticated(true);
          } else {
            // Customer or other role - clear auth
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            localStorage.removeItem('admin_auth');
            setIsAuthenticated(false);
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_auth');
          setIsAuthenticated(false);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const res = await client.post('/auth/login', { email: username, password });
      const { accessToken, user: userData } = res.data;
      
      // Only allow ADMIN or MANAGER roles
      if (userData?.role !== 'ADMIN' && userData?.role !== 'MANAGER') {
        return { success: false, error: 'Acces interzis. Doar administratorii pot accesa acest panou.' };
      }
      
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_token', accessToken);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Username sau parolă incorecte' };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
