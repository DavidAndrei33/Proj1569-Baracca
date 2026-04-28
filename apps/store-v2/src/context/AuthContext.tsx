import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import client from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('store_token'));
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('store_token');
    if (token) {
      client.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('store_token');
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (pin: string) => {
    try {
      const res = await client.post('/auth/pin-login', { pin });
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('store_token', accessToken);
      setIsAuthenticated(true);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'PIN invalid' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('store_token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}