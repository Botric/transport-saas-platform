import { createContext, useContext, useState, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/client';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('passenger_token'));

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem('passenger_token', res.accessToken);
    setToken(res.accessToken);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiRegister({ name, email, password });
    localStorage.setItem('passenger_token', res.accessToken);
    setToken(res.accessToken);
  };

  const logout = () => {
    localStorage.removeItem('passenger_token');
    localStorage.removeItem('passenger_prefs');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
