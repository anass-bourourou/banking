
// Base API service for making HTTP requests
// This would be expanded in a real application to include more API endpoints

import { Account, Transaction, Beneficiary } from './DataService';

const BASE_URL = 'https://api.example.ma'; // Replace with actual API URL in production

// Simulated API delay
const API_DELAY = 800;

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // In a real app, this would add authentication headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Simulate API delay
  await delay(API_DELAY);

  // Simulate API response
  // In a real app, this would be a fetch call
  console.log(`API call to ${endpoint} with options:`, options);
  
  // For demo purposes, we're not making actual HTTP requests
  // Instead, we're returning mock data based on the endpoint and method
  return mockApiResponse(endpoint, options.method || 'GET', options.body);
}

// Mock API response function
async function mockApiResponse(endpoint: string, method: string, body?: any) {
  // Parse the body if it's a string
  let parsedBody = body;
  if (typeof body === 'string') {
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      // If it's not valid JSON, keep it as is
      parsedBody = body;
    }
  }

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

// Mock API functions
export const api = {
  // Account related endpoints
  accounts: {
    getAll: (): Account[] => {
      // Mock data - would be replaced with actual API call
      return [
        {
          id: 1,
          name: 'الحساب الجاري',
          number: '5482 7589 1234 5678',
          balance: 9850.75,
          currency: 'د.م.',
          history: [
            { month: 'يناير', amount: 8200 },
            { month: 'فبراير', amount: 8350 },
            { month: 'مارس', amount: 8100 },
            { month: 'أبريل', amount: 8400 },
            { month: 'ماي', amount: 8600 },
            { month: 'يونيو', amount: 9500 },
            { month: 'يوليوز', amount: 9700 },
            { month: 'غشت', amount: 9850.75 },
          ]
        },
        {
          id: 2,
          name: 'حساب التوفير',
          number: '5482 7589 9876 5432',
          balance: 25350.20,
          currency: 'د.م.',
          history: [
            { month: 'يناير', amount: 19500 },
            { month: 'فبراير', amount: 20800 },
            { month: 'مارس', amount: 21000 },
            { month: 'أبريل', amount: 22200 },
            { month: 'ماي', amount: 23500 },
            { month: 'يونيو', amount: 24800 },
            { month: 'يوليوز', amount: 25100 },
            { month: 'غشت', amount: 25350.20 },
          ]
        },
        {
          id: 3,
          name: 'حساب الاستثمار',
          number: '5482 7589 4567 8901',
          balance: 15760.50,
          currency: 'د.م.',
          history: [
            { month: 'يناير', amount: 16200 },
            { month: 'فبراير', amount: 16100 },
            { month: 'مارس', amount: 15900 },
            { month: 'أبريل', amount: 15500 },
            { month: 'ماي', amount: 15800 },
            { month: 'يونيو', amount: 15700 },
            { month: 'يوليوز', amount: 15900 },
            { month: 'غشت', amount: 15760.50 },
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
        { id: 1, description: 'تحويل الراتب', amount: 5500.00, type: 'credit', date: '15/09/2023' },
        { id: 2, description: 'إيجار الشقة', amount: 3200.00, type: 'debit', date: '12/09/2023' },
        { id: 3, description: 'مشتريات مرجان', amount: 728.75, type: 'debit', date: '10/09/2023' },
        { id: 4, description: 'مطعم المنزه', amount: 425.50, type: 'debit', date: '08/09/2023' },
        { id: 5, description: 'استرداد من سلمى', amount: 500.00, type: 'credit', date: '05/09/2023' },
        { id: 6, description: 'فاتورة الكهرباء', amount: 450.25, type: 'debit', date: '01/09/2023' },
      ];
    },
    getByAccountId: (accountId: number): Transaction[] => {
      // Mock data - would be replaced with actual API call
      const transactions = [
        { id: 1, description: 'تحويل الراتب', amount: 5500.00, type: 'credit', date: '15/09/2023', accountId: 1 },
        { id: 2, description: 'إيجار الشقة', amount: 3200.00, type: 'debit', date: '12/09/2023', accountId: 1 },
        { id: 3, description: 'مشتريات مرجان', amount: 728.75, type: 'debit', date: '10/09/2023', accountId: 1 },
        { id: 4, description: 'أرباح', amount: 350.50, type: 'credit', date: '01/09/2023', accountId: 2 },
        { id: 5, description: 'إيداع', amount: 5000.00, type: 'credit', date: '20/08/2023', accountId: 2 },
        { id: 6, description: 'أرباح الاستثمار', amount: 780.25, type: 'credit', date: '15/09/2023', accountId: 3 },
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
          name: 'فاطمة العلوي',
          iban: 'MA64 0163 0000 0100 0000 0000 0150',
          bic: 'BCMAMADC',
          email: 'fatima.alaoui@email.ma',
          phone: '06 12 34 56 78',
        },
        {
          id: '2',
          name: 'يوسف بنسعيد',
          iban: 'MA64 0099 0000 0100 0000 0000 0321',
          bic: 'ATTIMADC',
          email: 'youssef.bensaid@email.ma',
        },
        {
          id: '3',
          name: 'سلمى بنعلي',
          iban: 'MA64 0128 0000 0100 0000 0000 0456',
          bic: 'BPMAMAMC',
          phone: '07 65 43 21 09',
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
        ...beneficiary
      };
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
        name: data.name || 'محمد العمراني',
        email: data.email || 'mohammed.omrani@example.ma',
        phone: data.phone || '06 12 34 56 78',
        address: data.address || 'شارع محمد الخامس، الدار البيضاء 20250، المغرب',
        updatedAt: new Date().toISOString()
      };
    }
  }
};
