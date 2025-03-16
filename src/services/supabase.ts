
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);
  
  if (!isConfigured) {
    console.warn(
      'Supabase is not configured. You need to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'environment variables to use Supabase features. Falling back to mock data.'
    );
  }
  
  return isConfigured;
};

// Helper to check data service connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }
  
  try {
    // Attempt a simple query to check connection
    const { error } = await supabase.from('accounts').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    return false;
  }
};
