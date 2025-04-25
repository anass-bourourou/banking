
import { BaseService } from './BaseService';
import { SUPABASE_URL, SUPABASE_ANON_KEY, FEATURES } from '@/config/api.config';

/**
 * Initialize application services
 */
export const initServices = () => {
  console.log('🚀 Initializing application services...');
  
  // Initialize Supabase if credentials are available
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    BaseService.initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
    BaseService.setUseSupabase(FEATURES.USE_SUPABASE);
    console.log('✅ Supabase initialized');
  } else {
    console.warn('⚠️ Supabase credentials not found, using REST API');
    BaseService.setUseSupabase(false);
  }
  
  console.log('✅ Application services initialized');
};
