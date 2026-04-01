'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/services/api';
import { useRouter } from 'next/navigation';

interface User { id: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('mn_token');
    const u = localStorage.getItem('mn_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const save = (t: string, u: User) => {
    localStorage.setItem('mn_token', t);
    localStorage.setItem('mn_user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    save(res.token, res.user);
    router.push(res.user.role === 'ADMIN' ? '/admin' : '/dashboard/parent');
  };

  const register = async (email: string, password: string, phone?: string) => {
    const res = await authApi.register({ email, password, phone });
    save(res.token, res.user);
    router.push('/dashboard/parent');
  };

  const logout = () => {
    localStorage.removeItem('mn_token');
    localStorage.removeItem('mn_user');
    setToken(null); setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin: user?.role === 'ADMIN', loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
