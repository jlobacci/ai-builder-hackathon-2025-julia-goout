import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USERS, getProfile } from '@/lib/mock-data';

interface MockUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: MockUser | null;
  session: { user: MockUser } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_CREDENTIALS = {
  email: 'julia@goout.com',
  password: 'goout2024',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    const stored = localStorage.getItem('mock_user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const session = user ? { user } : null;

  const signIn = useCallback(async (email: string, password: string) => {
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      const mockUser: MockUser = { id: MOCK_USERS.julia.id, email: MOCK_USERS.julia.email };
      setUser(mockUser);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      return { success: true };
    }
    return { success: false, error: 'E-mail ou senha incorretos.' };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    window.location.replace('/auth?logged_out=1');
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading: false, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
