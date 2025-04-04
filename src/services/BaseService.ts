
import { supabase, isSupabaseConfigured } from './supabase';

export abstract class BaseService {
  // Helper to check if we should use Supabase or backend API
  protected static useSupabase(): boolean {
    return isSupabaseConfigured();
  }

  // Helper to check if we should fallback to mock data - always returns false now
  protected static useMockData(): boolean {
    return false; // Never use mock data, always use backend API
  }

  protected static getSupabase() {
    return supabase;
  }
}
