
// Base API service for making HTTP requests
// This would be expanded in a real application to include more API endpoints

const BASE_URL = 'https://api.example.com'; // Replace with actual API URL in production

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // In a real app, this would add authentication headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
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
      ];
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
    }
  }
};
