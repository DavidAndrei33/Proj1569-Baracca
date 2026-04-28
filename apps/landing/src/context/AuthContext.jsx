import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      client.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          setIsLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('rotiserie_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('[Auth] Attempting login for:', email);
      const res = await client.post('/auth/login', { email, password });
      console.log('[Auth] Login response:', res.data);
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('rotiserie_user', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      console.error('[Auth] Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Eroare la autentificare';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await client.post('/auth/register', { name, email, phone, password });
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('rotiserie_user', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.response?.data?.error || 'Eroare la înregistrare' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('rotiserie_user');
  };

  const updateProfile = async (data) => {
    try {
      const res = await client.put(`/auth/users/${user.id}`, data);
      const updated = res.data;
      setUser(updated);
      localStorage.setItem('rotiserie_user', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Eroare la actualizare' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
