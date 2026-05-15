import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { logEvent } from '../services/LogService';

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const classifyError = (message: string): string => {
    const m = message.toLowerCase();
    if (m.includes('failed to fetch') || m.includes('networkerror'))
      return 'Network error — unable to reach the server. Check your connection or try again shortly.';
    if (m.includes('invalid login credentials'))
      return 'Invalid email or password. Please try again.';
    if (m.includes('email not confirmed'))
      return 'Please confirm your email before logging in.';
    if (m.includes('user already registered'))
      return 'An account with this email already exists. Try logging in instead.';
    if (m.includes('password'))
      return 'Password must be at least 6 characters.';
    return message;
  };

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return classifyError(error.message);
    // Fire-and-forget: log successful login
    logEvent({
      event_type: 'AUTH',
      message: `Login successful`,
      metadata: { email },
    });
    return null;
  };

  const signUp = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return classifyError(error.message);
    logEvent({
      event_type: 'AUTH',
      message: `New account registered`,
      metadata: { email },
    });
    return null;
  };

  const signOut = async (): Promise<void> => {
    logEvent({ event_type: 'AUTH', message: 'User signed out' });
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return classifyError(error.message);
    logEvent({ event_type: 'AUTH', message: `Password reset requested`, metadata: { email } });
    return null;
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
