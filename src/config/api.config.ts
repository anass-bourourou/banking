
// API configuration file

// Backend API URL (update this when deploying)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Feature flags
export const USE_MOCK_DATA = false; // Always use backend API
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Session configuration
export const SESSION_TIMEOUT_MINUTES = 20;
export const SESSION_CHECK_INTERVAL_MS = 60000; // 1 minute

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    RESET_PASSWORD: '/auth/reset-password',
  },
  ACCOUNTS: {
    LIST: '/accounts',
    DETAIL: (id: number) => `/accounts/${id}`,
  },
  TRANSACTIONS: {
    RECENT: '/transactions/recent',
    BY_ACCOUNT: (id: number) => `/transactions/account/${id}`,
    CREATE: '/transfers',
  },
  BENEFICIARIES: {
    LIST: '/beneficiaries',
    CREATE: '/beneficiaries',
    UPDATE: (id: string) => `/beneficiaries/${id}`,
    DELETE: (id: string) => `/beneficiaries/${id}`,
  },
  STATEMENTS: {
    LIST: '/statements',
    DOWNLOAD: (id: string) => `/statements/${id}/download`,
  },
  BILLS: {
    LIST: '/bills',
    PAY: '/bills/pay',
    RECEIPTS: '/bills/receipts',
  },
};
