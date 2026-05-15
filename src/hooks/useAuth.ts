import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export type AuthMode = 'login' | 'signup' | 'reset';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  resendConfirmation: (email: string) => Promise<string | null>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const classifyError = (message: string): string => {
    if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror')) {
      return 'Network error — unable to reach the server. Check your connection or try again shortly.';
    }
    if (message.toLowerCase().includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.toLowerCase().includes('email not confirmed')) {
      return 'Please confirm your email before logging in.';
    }
    if (message.toLowerCase().includes('user already registered')) {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (message.toLowerCase().includes('password')) {
      return 'Password must be at least 6 characters.';
    }
    return message;
  };

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? classifyError(error.message) : null;
  };

  const signUp = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? classifyError(error.message) : null;
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return error ? classifyError(error.message) : null;
  };

  const resendConfirmation = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return error ? classifyError(error.message) : null;
  };

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmation,
  };
};
