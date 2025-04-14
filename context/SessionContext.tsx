import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Import Provider type from supabase
import { Provider } from '@supabase/supabase-js';

// Define the shape of our session context
interface SessionContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (options: { provider: Provider, options?: { redirectTo?: string } }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create the context with a default value
const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
  signIn: async () => ({ error: new Error('Not implemented') }),
  signUp: async () => ({ error: new Error('Not implemented') }),
  signInWithOAuth: async () => ({ error: new Error('Not implemented') }),
  signOut: async () => {},
  refreshSession: async () => {},
});

// Hook for easy context consumption
export const useSession = () => useContext(SessionContext);

// Provider component
export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and set up session listener
  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error during sign in') };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error during sign up') };
    }
  };

  // Sign in with OAuth provider
  const signInWithOAuth = async (params: { provider: Provider, options?: { redirectTo?: string } }) => {
    try {
      console.log('Starting OAuth sign-in with provider:', params.provider);
      
      // Set default redirect URL if not provided
      const options = {
        ...params.options,
        redirectTo: params.options?.redirectTo || 'acme://login',
        flowType: 'implicit' as const, // Explicitly use implicit flow
      };
      
      console.log('Using redirect URL:', options.redirectTo, 'with flow type:', options.flowType);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: params.provider,
        options,
      });

      console.log('OAuth response:', data ? 'Data received' : 'No data', error ? `Error: ${error.message}` : 'No error');

      if (error) {
        console.error('OAuth sign-in error:', error.message);
        return { error };
      }

      if (!data.url) {
        console.error('No OAuth URL returned');
        return { error: new Error('No OAuth URL returned from Supabase') };
      }

      console.log('OAuth URL generated:', data.url);
      
      // Explicitly open the URL in case the automatic redirect doesn't work
      if (Platform.OS !== 'web') {
        const canOpen = await Linking.canOpenURL(data.url);
        if (canOpen) {
          console.log('Opening OAuth URL manually');
          await Linking.openURL(data.url);
        } else {
          console.error('Cannot open OAuth URL:', data.url);
          return { error: new Error('Cannot open OAuth URL') };
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during OAuth sign-in:', error);
      return { error: error instanceof Error ? error : new Error('Unknown error during OAuth sign in') };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  // Refresh the session
  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
  };

  // Provide the context value
  const value = {
    session,
    loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    refreshSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}; 