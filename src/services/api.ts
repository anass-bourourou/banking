// Base API service for making HTTP requests to Express backend

import { Account } from './AccountService';
import { Beneficiary } from './BeneficiaryService';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
  recipient_name?: string;
  recipient_account?: string;
  transfer_type?: 'standard' | 'instant' | 'scheduled' | 'mass';
  reference_id?: string;
  fees?: number;
}

// Change this to your Express.js backend URL (e.g., localhost in development, or deployed URL in production)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Auth token management
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper to check if we're in mock mode or should use real API
const useMockData = () => {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true' || !API_URL;
};

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // If using mock data, return mock response
  if (useMockData()) {
    console.log(`Using mock data for ${endpoint}`);
    return mockApiResponse(endpoint, options.method || 'GET', options.body);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Mock API response function for development/fallback
async function mockApiResponse(endpoint: string, method: string, body?: any) {
  // Parse the body if it's a string
  let parsedBody = body;
  if (typeof body === 'string') {
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      parsedBody = body;
    }
  }

  console.log(`[MOCK] ${method} ${endpoint}`, parsedBody);

  // Simulate different responses based on endpoint and method
  if (method === 'GET') {
    // GET requests
    if (endpoint === '/accounts') {
      return { json: () => Promise.resolve(api.accounts.getAll()) };
    } else if (endpoint.startsWith('/accounts/')) {
      const idStr = endpoint.split('/accounts/')[1];
      const id = parseInt(idStr, 10);
      return { json: () => Promise.resolve(api.accounts.getById(id)) };
    } else if (endpoint === '/transactions/recent') {
      return { json: () => Promise.resolve(api.transactions.getRecent()) };
    } else if (endpoint.startsWith('/transactions/account/')) {
      const idStr = endpoint.split('/transactions/account/')[1];
      const id = parseInt(idStr, 10);
      return { json: () => Promise.resolve(api.transactions.getByAccountId(id)) };
    } else if (endpoint === '/beneficiaries') {
      return { json: () => Promise.resolve(api.beneficiaries.getAll()) };
    } else if (endpoint === '/statements') {
      return { json: () => Promise.resolve(api.statements.getAll()) };
    }
  } else if (method === 'POST') {
    // POST requests
    if (endpoint === '/transfers') {
      return { 
        json: () => Promise.resolve(api.transactions.createTransfer(parsedBody))
      };
    } else if (endpoint === '/beneficiaries') {
      return { 
        json: () => Promise.resolve(api.beneficiaries.create(parsedBody))
      };
    } else if (endpoint.includes('/download')) {
      return {
        json: () => Promise.resolve({ success: true })
      };
    }
  } else if (method === 'PUT' || method === 'PATCH') {
    // PUT/PATCH requests
    if (endpoint.includes('/beneficiaries/')) {
      const id = endpoint.split('/beneficiaries/')[1].split('/')[0];
      return {
        json: () => Promise.resolve({ ...parsedBody, id })
      };
    }
  } else if (method === 'DELETE') {
    // DELETE requests
    if (endpoint.includes('/beneficiaries/')) {
      return {
        json: () => Promise.resolve({ success: true })
      };
    }
  }

  // Default response for unhandled endpoints
  return { 
    json: () => Promise.resolve({ 
      error: 'Endpoint not implemented in mock API',
      endpoint,
      method 
    })
  };
}

// Mock API functions - will be used when API_URL is not provided or in mock mode
export const api = {
  // Account related endpoints
  accounts: {
    getAll: (): Account[] => {
      // Mock data - would be replaced with actual API call
      return [
        {
          id: 1,
          name: 'Compte Courant',
          number: '5482 7589 1234 5678',
          balance: 9850.75,
          currency: 'MAD',
          history: [
            { month: 'Janvier', amount: 8200 },
            { month: 'Février', amount: 8350 },
            { month: 'Mars', amount: 8100 },
            { month: 'Avril', amount: 8400 },
            { month: 'Mai', amount: 8600 },
            { month: 'Juin', amount: 9500 },
            { month: 'Juillet', amount: 9700 },
            { month: 'Août', amount: 9850.75 },
          ]
        },
        {
          id: 2,
          name: 'Compte Épargne',
          number: '5482 7589 9876 5432',
          balance: 25350.20,
          currency: 'MAD',
          history: [
            { month: 'Janvier', amount: 19500 },
            { month: 'Février', amount: 20800 },
            { month: 'Mars', amount: 21000 },
            { month: 'Avril', amount: 22200 },
            { month: 'Mai', amount: 23500 },
            { month: 'Juin', amount: 24800 },
            { month: 'Juillet', amount: 25100 },
            { month: 'Août', amount: 25350.20 },
          ]
        },
        {
          id: 3,
          name: 'Compte Investissement',
          number: '5482 7589 4567 8901',
          balance: 15760.50,
          currency: 'MAD',
          history: [
            { month: 'Janvier', amount: 16200 },
            { month: 'Février', amount: 16100 },
            { month: 'Mars', amount: 15900 },
            { month: 'Avril', amount: 15500 },
            { month: 'Mai', amount: 15800 },
            { month: 'Juin', amount: 15700 },
            { month: 'Juillet', amount: 15900 },
            { month: 'Août', amount: 15760.50 },
          ]
        }
      ];
    },
    getById: (id: number): Account | null => {
      const accounts = api.accounts.getAll();
      return accounts.find(account => account.id === id) || null;
    }
  },
  
  // Transaction related endpoints 
  transactions: {
    getRecent: (): Transaction[] => {
      // Mock data - would be replaced with actual API call
      return [
        { id: 1, description: 'Salaire Attijariwafa Bank', amount: 8500.00, type: 'credit', date: '15/09/2023', status: 'completed' },
        { id: 2, description: 'Loyer Appartement', amount: 3800.00, type: 'debit', date: '12/09/2023', status: 'completed' },
        { id: 3, description: 'Marjane Casablanca', amount: 720.75, type: 'debit', date: '10/09/2023', status: 'completed' },
        { id: 4, description: 'Restaurant Dar Naji', amount: 350.50, type: 'debit', date: '08/09/2023', status: 'completed' },
        { id: 5, description: 'Remboursement Karim', amount: 500.00, type: 'credit', date: '05/09/2023', status: 'completed' },
        { id: 6, description: 'Facture ONEE', amount: 450.25, type: 'debit', date: '01/09/2023', status: 'completed' },
      ];
    },
    getByAccountId: (accountId: number): Transaction[] => {
      // Mock data - would be replaced with actual API call
      const transactions = [
        { id: 1, description: 'Salaire Attijariwafa Bank', amount: 8500.00, type: 'credit', date: '15/09/2023', accountId: 1, status: 'completed' },
        { id: 2, description: 'Loyer Appartement', amount: 3800.00, type: 'debit', date: '12/09/2023', accountId: 1, status: 'completed' },
        { id: 3, description: 'Marjane Casablanca', amount: 720.75, type: 'debit', date: '10/09/2023', accountId: 1, status: 'completed' },
        { id: 4, description: 'Dividendes CIH Bank', amount: 350.50, type: 'credit', date: '01/09/2023', accountId: 2, status: 'completed' },
        { id: 5, description: 'Dépôt Agence', amount: 5000.00, type: 'credit', date: '20/08/2023', accountId: 2, status: 'completed' },
        { id: 6, description: 'Dividendes Bourse de Casablanca', amount: 780.25, type: 'credit', date: '15/09/2023', accountId: 3, status: 'completed' },
      ].filter(t => t.accountId === accountId)
       .map(({ accountId, ...rest }) => rest as Transaction);
      
      return transactions;
    },
    createTransfer: (data: {
      fromAccount: number;
      toAccount: number | string;
      amount: number;
      description?: string;
    }) => {
      // Mock transfer creation
      return {
        success: true,
        transferId: `TR-${Date.now()}`,
        date: new Date().toLocaleDateString('ar-MA'),
        status: 'completed',
        ...data
      };
    }
  },
  
  // Beneficiaries related endpoints
  beneficiaries: {
    getAll: (): Beneficiary[] => {
      // Mock data - would be replaced with actual API call
      return [
        {
          id: '1',
          name: 'Fatima Alaoui',
          iban: 'MA64 0163 0000 0100 0000 0000 0150',
          bic: 'BCMAMADC',
          email: 'fatima.alaoui@email.ma',
          phone: '06 12 34 56 78',
          favorite: false
        },
        {
          id: '2',
          name: 'Youssef Bensaid',
          iban: 'MA64 0099 0000 0100 0000 0000 0321',
          bic: 'ATTIMADC',
          email: 'youssef.bensaid@email.ma',
          favorite: true
        },
        {
          id: '3',
          name: 'Salma Benali',
          iban: 'MA64 0128 0000 0100 0000 0000 0456',
          bic: 'BPMAMAMC',
          phone: '07 65 43 21 09',
          favorite: false
        },
      ];
    },
    create: (beneficiary: {
      name: string;
      iban: string;
      bic?: string;
      email?: string;
      phone?: string;
    }): Beneficiary => {
      // Mock beneficiary creation
      return {
        id: `BEN-${Date.now()}`,
        favorite: false,
        ...beneficiary
      };
    }
  },
  
  // Statements related endpoints
  statements: {
    getAll: (): BankStatement[] => {
      return [
        {
          id: 'state-1',
          accountId: 1,
          accountName: 'Compte Courant',
          period: 'Août 2023',
          date: '2023-09-01',
          fileUrl: '/statements/statement-august-2023.pdf',
          status: 'available',
          downloadCount: 2
        },
        {
          id: 'state-2',
          accountId: 1,
          accountName: 'Compte Courant',
          period: 'Juillet 2023',
          date: '2023-08-01',
          fileUrl: '/statements/statement-july-2023.pdf',
          status: 'available',
          downloadCount: 1
        },
        {
          id: 'state-3',
          accountId: 2,
          accountName: 'Compte Épargne',
          period: 'Août 2023',
          date: '2023-09-01',
          fileUrl: '/statements/statement-savings-august-2023.pdf',
          status: 'available',
          downloadCount: 0
        },
        {
          id: 'state-4',
          accountId: 3,
          accountName: 'Compte Investissement',
          period: 'Août 2023',
          date: '2023-09-01',
          status: 'processing',
          downloadCount: 0
        }
      ];
    }
  },
  
  // User profile
  user: {
    updateProfile: async (data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    }) => {
      // Mock user update
      return {
        id: 'usr_123456789',
        name: data.name || 'Mohammed Omrani',
        email: data.email || 'mohammed.omrani@example.ma',
        phone: data.phone || '06 12 34 56 78',
        address: data.address || 'Avenue Mohammed V, Casablanca 20250, Maroc',
        updatedAt: new Date().toISOString()
      };
    }
  }
};

// Interface for BankStatement pour la réponse mock
interface BankStatement {
  id: string;
  accountId: number;
  accountName: string;
  period: string;
  date: string;
  fileUrl?: string;
  status: 'available' | 'processing';
  downloadCount: number;
}
