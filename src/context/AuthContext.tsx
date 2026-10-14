import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  authModalState: { isOpen: boolean; mode: 'login' | 'signup' };
  isFirstLoginWelcome: boolean;
  isFirstVisit: boolean;
  enterGuestMode: () => void;
  resetToGateway: () => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  dismissWelcome: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; bio?: string; preferences?: any }) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY_TOKEN = 'otherwise_auth_token_v1';
const STORAGE_KEY_USER = 'otherwise_auth_user_v1';
const STORAGE_KEY_VISITED = 'otherwise_has_visited_gateway_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY_TOKEN));
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLoginWelcome, setIsFirstLoginWelcome] = useState<boolean>(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    return !localStorage.getItem(STORAGE_KEY_TOKEN) && !localStorage.getItem(STORAGE_KEY_VISITED);
  });
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login',
  });

  // Verify persistent session on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      } catch (err) {
        console.error('Session verify error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setError(null);
    setAuthModalState({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setError(null);
    setAuthModalState({ isOpen: false, mode: 'login' });
  };

  const dismissWelcome = () => {
    setIsFirstLoginWelcome(false);
  };

  const enterGuestMode = () => {
    localStorage.setItem(STORAGE_KEY_VISITED, 'true');
    setIsFirstVisit(false);
  };

  const resetToGateway = () => {
    setIsFirstVisit(true);
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to sign up');
        setIsLoading(false);
        return { success: false, error: data.error || 'Sign up failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
      localStorage.setItem(STORAGE_KEY_VISITED, 'true');
      setIsFirstVisit(false);
      closeAuthModal();
      setIsFirstLoginWelcome(true);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Network error during sign up';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setIsLoading(false);
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
      localStorage.setItem(STORAGE_KEY_VISITED, 'true');
      setIsFirstVisit(false);
      closeAuthModal();
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Network error during login';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error(e);
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const updateProfile = async (updates: { name?: string; bio?: string; preferences?: any }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Update failed' };

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        authModalState,
        isFirstLoginWelcome,
        isFirstVisit,
        enterGuestMode,
        resetToGateway,
        openAuthModal,
        closeAuthModal,
        dismissWelcome,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
