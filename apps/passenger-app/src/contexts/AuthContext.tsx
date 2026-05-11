import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, registerFcmToken, removeFcmToken } from '../api/client';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Try to get the FCM device token via Capacitor Push Notifications and register it */
async function tryRegisterFcmToken() {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    let permResult = await PushNotifications.checkPermissions();
    if (permResult.receive === 'prompt') {
      permResult = await PushNotifications.requestPermissions();
    }
    if (permResult.receive !== 'granted') return;
    await PushNotifications.register();
    PushNotifications.addListener('registration', async (token) => {
      try {
        await registerFcmToken(token.value);
      } catch {
        // Non-critical — notifications will just not arrive
      }
    });
  } catch {
    // Capacitor Push Notifications not available in web browser — skip silently
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('passenger_token'));

  // Register FCM token when authenticated
  useEffect(() => {
    if (token) {
      tryRegisterFcmToken();
    }
  }, [token]);

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

  const logout = async () => {
    try {
      await removeFcmToken();
    } catch {
      // Non-critical
    }
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
