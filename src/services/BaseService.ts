
import { supabase, isSupabaseConfigured } from './supabase';

export abstract class BaseService {
  // Helper to check if we should use Supabase or mock API
  protected static useSupabase(): boolean {
    return isSupabaseConfigured();
  }

  protected static getSupabase() {
    return supabase;
  }
}
