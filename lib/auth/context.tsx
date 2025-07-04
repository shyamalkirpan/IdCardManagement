'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authClient } from './client';
import type { AuthUser, LoginCredentials, SignupData, AuthError } from './types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<{ user: AuthUser | null; error: AuthError | null }>;
  signUp: (signupData: SignupData) => Promise<{ user: AuthUser | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const currentUser = await authClient.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Don't log sensitive information in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Error getting initial user:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = authClient.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const result = await authClient.signIn(credentials);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (signupData: SignupData) => {
    setLoading(true);
    try {
      const result = await authClient.signUp(signupData);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authClient.signOut();
      if (!result.error) {
        setUser(null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Don't log sensitive information in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing user:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };