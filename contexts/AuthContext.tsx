'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  companyName?: string | null;
  tin?: string | null;
}

interface SignupData {
  email: string;
  password: string;
  companyName?: string;
  tin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------
// SAFE FETCH WRAPPER
// -----------------------------
async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Invalid JSON response from server');
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Request failed');
    }

    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error');
  }
}

// -----------------------------
// PROVIDER
// -----------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await safeFetch(`${API_URL}/api/auth/me`);
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await safeFetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(data.user || null);
  };

  const signup = async (payload: SignupData) => {
    const data = await safeFetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setUser(data.user || null);
  };

  const logout = async () => {
    await safeFetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// -----------------------------
// HOOK
// -----------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}