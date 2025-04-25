
/**
 * API Configuration
 * 
 * This file defines the API URL for different environments.
 * The API_URL is used for all API requests in the application.
 */

// Define environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const isLocal = window.location.hostname === 'localhost';

// Define base URLs for different environments
const LOCAL_API_URL = 'http://localhost:3000';
const DEV_API_URL = 'https://dev-api.yourbank.com';
const PROD_API_URL = 'https://api.yourbank.com';

// Set API_URL based on environment
export const API_URL = isLocal ? LOCAL_API_URL : (isDevelopment ? DEV_API_URL : PROD_API_URL);

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// API endpoints configuration
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  ACCOUNTS: {
    LIST: '/api/accounts',
    DETAIL: (id: string | number) => `/api/accounts/${id}`,
  },
  TRANSACTIONS: {
    LIST: '/api/transactions',
    DETAIL: (id: string | number) => `/api/transactions/${id}`,
    RECENT: '/api/transactions/recent',
    FILTER: '/api/transactions/filter',
  },
  BENEFICIARIES: {
    LIST: '/api/beneficiaries',
    ADD: '/api/beneficiaries',
    DETAIL: (id: string | number) => `/api/beneficiaries/${id}`,
  },
  TRANSFERS: {
    CREATE: '/api/transfers',
    MASS: '/api/transfers/mass',
    RECURRING: '/api/transfers/recurring',
  },
  STATEMENTS: {
    LIST: '/api/statements',
    DOWNLOAD: (id: string | number) => `/api/statements/${id}/download`,
  },
};

// Feature flags
export const FEATURES = {
  USE_SUPABASE: true,       // Whether to use Supabase or REST API
  ENABLE_TRANSFERS: true,   // Enable transfer functionality
  ENABLE_PAYMENTS: true,    // Enable payment functionality
  ENABLE_STATEMENTS: true,  // Enable statements functionality
  ENABLE_COMPLAINTS: true,  // Enable complaints functionality
  DEMO_MODE: false,         // Whether the app is in demo mode
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'YourBank',
  APP_VERSION: '1.0.0',
  CURRENCY: 'MAD',
  LANGUAGE: 'fr-MA',
};
