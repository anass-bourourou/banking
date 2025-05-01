
import { BaseService } from './BaseService';
import { FEATURES } from '@/config/api.config';

/**
 * Initialize application services
 */
export const initServices = () => {
  console.log('🚀 Initializing application services...');
  
  // Set the backend flag based on feature flag
  BaseService.setUseBackend(FEATURES.USE_BACKEND);
  
  if (FEATURES.USE_BACKEND) {
    console.log('✅ SpringBoot backend integration enabled');
  } else {
    console.log('⚠️ Using mock data, backend integration disabled');
  }
  
  console.log('✅ Application services initialized');
};
