
import { BaseService } from './BaseService';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

export interface Account {
  id: number;
  name: string;
  number: string;
  balance: number;
  currency: string;
  history: { month: string; amount: number }[];
  phone_number?: string;
  email?: string;
  city?: string;
  country?: string;
  address?: string;
}

export class AccountService extends BaseService {
  // Static accounts data
  private static accounts: Account[] = [
    {
      id: 1,
      name: "Compte Courant",
      number: "011 810 0000012345678901 23",
      balance: 45780.25,
      currency: "MAD",
      history: [
        { month: "Jan", amount: 42500 },
        { month: "Fév", amount: 43200 },
        { month: "Mar", amount: 41800 },
        { month: "Avr", amount: 44500 },
        { month: "Mai", amount: 45780.25 }
      ],
      phone_number: "+212 661234567",
      email: "demo@cih.ma",
      city: "Casablanca",
      country: "Maroc",
      address: "123 Avenue Hassan II"
    },
    {
      id: 2,
      name: "Compte Épargne",
      number: "011 810 0000098765432101 45",
      balance: 125350.75,
      currency: "MAD",
      history: [
        { month: "Jan", amount: 120000 },
        { month: "Fév", amount: 121500 },
        { month: "Mar", amount: 122800 },
        { month: "Avr", amount: 124100 },
        { month: "Mai", amount: 125350.75 }
      ],
      phone_number: "+212 661234567",
      email: "demo@cih.ma",
      city: "Casablanca",
      country: "Maroc",
      address: "123 Avenue Hassan II"
    }
  ];

  static async getAccounts(): Promise<Account[]> {
    try {
      // Return static accounts data
      return [...this.accounts];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Impossible de récupérer les comptes');
      throw new Error('Impossible de récupérer les comptes');
    }
  }

  static async getAccountById(id: number): Promise<Account | null> {
    try {
      // Find account in static data
      const account = this.accounts.find(acc => acc.id === id);
      
      if (!account) {
        return null;
      }
      
      return {...account};
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      toast.error('Impossible de récupérer les détails du compte');
      throw new Error('Impossible de récupérer les détails du compte');
    }
  }

  static async updateAccountBalance(accountId: number, data: { balance: number }): Promise<void> {
    try {
      // Update account balance in static data
      const accountIndex = this.accounts.findIndex(acc => acc.id === accountId);
      
      if (accountIndex !== -1) {
        this.accounts[accountIndex].balance = data.balance;
      }
    } catch (error) {
      console.error(`Error updating account balance for ${accountId}:`, error);
      toast.error('Impossible de mettre à jour le solde du compte');
      throw new Error('Impossible de mettre à jour le solde du compte');
    }
  }
}
