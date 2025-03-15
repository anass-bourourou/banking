// Base API service for making HTTP requests
// This would be expanded in a real application to include more API endpoints

const BASE_URL = 'https://api.example.com'; // Replace with actual API URL in production

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
    if (endpoint.startsWith('/accounts')) {
      return { json: () => Promise.resolve(api.accounts.getAll()) };
    } else if (endpoint.startsWith('/transactions')) {
      return { json: () => Promise.resolve(api.transactions.getRecent()) };
    } else if (endpoint.startsWith('/beneficiaries')) {
      return { json: () => Promise.resolve(api.beneficiaries.getAll()) };
    }
  } else if (method === 'POST') {
    // POST requests
    if (endpoint === '/transfers') {
      return { 
        json: () => Promise.resolve({
          success: true,
          message: 'Virement effectué avec succès',
          transferId: `TR-${Date.now()}`
        })
      };
    } else if (endpoint === '/beneficiaries') {
      return { 
        json: () => Promise.resolve({
          success: true,
          message: 'Bénéficiaire ajouté avec succès',
          beneficiaryId: `BEN-${Date.now()}`
        })
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
    getAll: async () => {
      // Mock data - would be replaced with actual API call
      return [
        {
          id: 1,
          name: 'Compte Courant',
          number: '5482 7589 1234 5678',
          balance: 4850.75,
          currency: '€',
          history: [
            { month: 'Jan', amount: 4200 },
            { month: 'Fév', amount: 4350 },
            { month: 'Mar', amount: 4100 },
            { month: 'Avr', amount: 4400 },
            { month: 'Mai', amount: 4600 },
            { month: 'Jun', amount: 4500 },
            { month: 'Jul', amount: 4700 },
            { month: 'Aoû', amount: 4850.75 },
          ]
        },
        {
          id: 2,
          name: 'Compte Épargne',
          number: '5482 7589 9876 5432',
          balance: 12350.20,
          currency: '€',
          history: [
            { month: 'Jan', amount: 10500 },
            { month: 'Fév', amount: 10800 },
            { month: 'Mar', amount: 11000 },
            { month: 'Avr', amount: 11200 },
            { month: 'Mai', amount: 11500 },
            { month: 'Jun', amount: 11800 },
            { month: 'Jul', amount: 12100 },
            { month: 'Aoû', amount: 12350.20 },
          ]
        },
        {
          id: 3,
          name: 'Compte Investissement',
          number: '5482 7589 4567 8901',
          balance: 8760.50,
          currency: '€',
          history: [
            { month: 'Jan', amount: 9200 },
            { month: 'Fév', amount: 9100 },
            { month: 'Mar', amount: 8900 },
            { month: 'Avr', amount: 9000 },
            { month: 'Mai', amount: 8800 },
            { month: 'Jun', amount: 8700 },
            { month: 'Jul', amount: 8900 },
            { month: 'Aoû', amount: 8760.50 },
          ]
        }
      ];
    },
    getById: async (id: number) => {
      const accounts = await api.accounts.getAll();
      return accounts.find(account => account.id === id) || null;
    }
  },
  
  // Transaction related endpoints 
  transactions: {
    getRecent: async () => {
      // Mock data - would be replaced with actual API call
      return [
        { id: 1, description: 'Virement Salaire', amount: 2500.00, type: 'credit', date: '15/09/2023' },
        { id: 2, description: 'Loyer Appartement', amount: 950.00, type: 'debit', date: '12/09/2023' },
        { id: 3, description: 'Courses Supermarché', amount: 128.75, type: 'debit', date: '10/09/2023' },
        { id: 4, description: 'Restaurant La Brasserie', amount: 68.50, type: 'debit', date: '08/09/2023' },
        { id: 5, description: 'Remboursement Marie', amount: 45.00, type: 'credit', date: '05/09/2023' },
        { id: 6, description: 'Facture Électricité', amount: 78.25, type: 'debit', date: '01/09/2023' },
      ];
    },
    getByAccountId: async (accountId: number) => {
      // Mock data - would be replaced with actual API call
      return [
        { id: 1, description: 'Virement Salaire', amount: 2500.00, type: 'credit', date: '15/09/2023', account: accountId },
        { id: 2, description: 'Loyer Appartement', amount: 950.00, type: 'debit', date: '12/09/2023', account: accountId },
        { id: 3, description: 'Courses Supermarché', amount: 128.75, type: 'debit', date: '10/09/2023', account: accountId },
      ].filter(transaction => transaction.account === accountId);
    },
    createTransfer: async (data: {
      fromAccount: number;
      toAccount: number;
      amount: number;
      description?: string;
    }) => {
      // Mock transfer creation
      return {
        id: `TR-${Date.now()}`,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'completed',
        ...data
      };
    }
  },
  
  // Beneficiaries related endpoints
  beneficiaries: {
    getAll: async () => {
      // Mock data - would be replaced with actual API call
      return [
        {
          id: '1',
          name: 'Marie Durand',
          iban: 'FR76 3000 4000 1200 0000 9876 543',
          bic: 'BNPAFRPP',
          email: 'marie.durand@email.com',
          phone: '06 12 34 56 78',
        },
        {
          id: '2',
          name: 'Pierre Martin',
          iban: 'FR76 1234 5678 9101 1121 3141 516',
          bic: 'AGRIFRPP',
          email: 'pierre.martin@email.com',
        },
        {
          id: '3',
          name: 'Sophie Leroy',
          iban: 'FR76 9876 5432 1098 7654 3210 123',
          bic: 'SOGEFRPP',
          phone: '07 65 43 21 09',
        },
      ];
    },
    create: async (beneficiary: {
      name: string;
      iban: string;
      bic?: string;
      email?: string;
      phone?: string;
    }) => {
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
        name: data.name || 'Jean Dupont',
        email: data.email || 'jean.dupont@example.com',
        phone: data.phone || '06 12 34 56 78',
        address: data.address || '123 Rue de Paris, 75001 Paris',
        updatedAt: new Date().toISOString()
      };
    }
  }
};
