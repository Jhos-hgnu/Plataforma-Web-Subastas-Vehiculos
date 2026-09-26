import { createContext, useContext, useState, type ReactNode } from 'react';
import { fetchApi } from '../lib/api';
import type { Session } from '../types';

const storageKey = 'autobid-session';
interface AuthValue { session: Session | null; login: (email: string, password: string) => Promise<void>; register: (data: Record<string, string>) => Promise<void>; logout: () => void; }
const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as Session : null;
  });
  const save = (next: Session) => { localStorage.setItem(storageKey, JSON.stringify(next)); setSession(next); };
  const login = async (email: string, password: string) => save(await fetchApi<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }));
  const register = async (data: Record<string, string>) => save(await fetchApi<Session>('/auth/register', { method: 'POST', body: JSON.stringify(data) }));
  const logout = () => { localStorage.removeItem(storageKey); setSession(null); };
  return <AuthContext.Provider value={{ session, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider requerido'); return value; }
