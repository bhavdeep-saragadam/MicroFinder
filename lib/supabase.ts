import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Use hardcoded values as a fallback, but prefer the ones from Constants (app.config.js)
const SUPABASE_URL = 'https://plstvnouqxzsfdqjzdkz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsc3R2bm91cXh6c2ZkcWp6ZGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDk4NDcsImV4cCI6MjA1OTcyNTg0N30.s1R8LFHcyEZwydY0iIXNcIMqoo3kWdjBsEciByrEnYk';

// Create a memory storage as a fallback for AsyncStorage errors
const memoryStorage = {
  data: new Map<string, string>(),
  getItem: async (key: string): Promise<string | null> => {
    return memoryStorage.data.get(key) || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStorage.data.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    memoryStorage.data.delete(key);
  }
};

// Try to use AsyncStorage first, fall back to memory storage
const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('Falling back to memory storage:', error);
      return memoryStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('Falling back to memory storage:', error);
      await memoryStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Falling back to memory storage:', error);
      await memoryStorage.removeItem(key);
    }
  }
};

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other table types as needed
    };
  };
}; 