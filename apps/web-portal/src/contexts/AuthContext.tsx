import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin } from '../api/client';

// Decode a JWT payload without verifying the signature (verification is server-side)
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: string | null;
  organisationId: string | null;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [organisationId, setOrganisationId] = useState<string | null>(
    localStorage.getItem('organisationId'),
  );

  // Keep role in sync if a new token is loaded from storage on mount
  useEffect(() => {
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        const r = payload.role ?? null;
        const o = payload.organisationId ?? null;
        setRole(r);
        setOrganisationId(o);
        if (r) localStorage.setItem('role', r);
        if (o) localStorage.setItem('organisationId', o);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('role', data.role ?? 'read_only');
    localStorage.setItem('organisationId', data.organisationId ?? '');
    setToken(data.accessToken);
    setUserId(data.userId);
    setRole(data.role ?? 'read_only');
    setOrganisationId(data.organisationId ?? null);
  };

  const logout = () => {
    ['token', 'userId', 'role', 'organisationId'].forEach((k) =>
      localStorage.removeItem(k),
    );
    setToken(null);
    setUserId(null);
    setRole(null);
    setOrganisationId(null);
  };

  // Returns true if the current user has at least one of the given roles.
  // super_admin and org_admin pass all checks.
  const hasRole = (...roles: string[]): boolean => {
    if (!role) return false;
    if (role === 'super_admin' || role === 'org_admin') return true;
    return roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{ token, userId, role, organisationId, isAuthenticated: !!token, hasRole, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

