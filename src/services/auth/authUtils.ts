
import { supabase, isSupabaseConfigured } from '../supabase';
import type { User } from './types';

/**
 * Helper function to check if Supabase should be used
 */
export const useSupabase = (): boolean => {
  return isSupabaseConfigured();
};

/**
 * Convert Supabase user data to our app's User format
 */
export const formatSupabaseUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || 'Utilisateur',
    email: supabaseUser.email || '',
    lastLogin: supabaseUser.last_sign_in_at || new Date().toISOString()
  };
};

/**
 * Get the current supabase client instance
 */
export const getSupabaseClient = () => {
  return supabase;
};
