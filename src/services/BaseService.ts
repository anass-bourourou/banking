
import { supabase, isSupabaseConfigured } from './supabase';

export abstract class BaseService {
  // Helper to check if we should use Supabase or backend API
  protected static useSupabase(): boolean {
    return isSupabaseConfigured();
  }

  // Helper to check if we should fallback to mock data
  protected static useMockData(): boolean {
    return false; // Always use backend API, fallback to mock only if API fails
  }

  protected static getSupabase() {
    return supabase;
  }
}
