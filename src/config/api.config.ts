
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
const LOCAL_API_URL = 'http://localhost:8080/api';
const DEV_API_URL = 'https://dev-api.anassbank.com/api';
const PROD_API_URL = 'https://api.anassbank.com/api';

// Set API_URL based on environment
export const API_URL = isLocal ? LOCAL_API_URL : (isDevelopment ? DEV_API_URL : PROD_API_URL);

// API endpoints configuration
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  ACCOUNTS: {
    LIST: '/accounts',
    DETAIL: (id: string | number) => `/accounts/${id}`,
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    DETAIL: (id: string | number) => `/transactions/${id}`,
    RECENT: '/transactions/recent',
    FILTER: '/transactions/filter',
  },
  BENEFICIARIES: {
    LIST: '/beneficiaries',
    ADD: '/beneficiaries',
    DETAIL: (id: string | number) => `/beneficiaries/${id}`,
  },
  TRANSFERS: {
    CREATE: '/transfers',
    MASS: '/transfers/mass',
    RECURRING: '/transfers/recurring',
  },
  STATEMENTS: {
    LIST: '/statements',
    DOWNLOAD: (id: string | number) => `/statements/${id}/download`,
  },
};

// Feature flags
export const FEATURES = {
  USE_BACKEND: true,     // Whether to use SpringBoot backend or mock data
  ENABLE_TRANSFERS: true,   // Enable transfer functionality
  ENABLE_PAYMENTS: true,    // Enable payment functionality
  ENABLE_STATEMENTS: true,  // Enable statements functionality
  ENABLE_COMPLAINTS: true,  // Enable complaints functionality
  DEMO_MODE: false,         // Whether the app is in demo mode
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'AnassBank',
  APP_VERSION: '1.0.0',
  CURRENCY: 'MAD',
  LANGUAGE: 'fr-MA',
};
