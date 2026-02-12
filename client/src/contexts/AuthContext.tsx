import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, clearToken } from '../services/axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to refresh token on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const { data } = await api.get('/auth/refresh');
        setToken(data.access_token);
        setUser(data.user);

        // Set up auto-refresh before token expires
        const expiresIn = data.token_expiration - Date.now();
        setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
      } catch (error) {
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // Handle logout event from axios interceptor
  useEffect(() => {
    function handleLogout() {
      setUser(null);
    }
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  async function refreshToken() {
    try {
      const { data } = await api.get('/auth/refresh');
      setToken(data.access_token);
      setUser(data.user);

      // Schedule next refresh
      const expiresIn = data.token_expiration - Date.now();
      setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
    } catch (error) {
      setUser(null);
      clearToken();
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.access_token);
    setUser(data.user);

    // Schedule refresh
    const expiresIn = data.token_expiration - Date.now();
    setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    setToken(data.access_token);
    setUser(data.user);

    // Schedule refresh
    const expiresIn = data.token_expiration - Date.now();
    setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      clearToken();
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
