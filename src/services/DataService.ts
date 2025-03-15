
import { fetchWithAuth, api } from './api';

export interface Account {
  id: number;
  name: string;
  number: string;
  balance: number;
  currency: string;
  history: { month: string; amount: number }[];
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic?: string;
  email?: string;
  phone?: string;
}

export interface TransferData {
  fromAccount: number;
  toAccount: number | string;
  amount: number;
  description?: string;
}

export class DataService {
  static async getAccounts(): Promise<Account[]> {
    try {
      const response = await fetchWithAuth('/accounts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Impossible de récupérer les comptes');
    }
  }

  static async getAccountById(id: number): Promise<Account | null> {
    try {
      const response = await fetchWithAuth(`/accounts/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      throw new Error('Impossible de récupérer les détails du compte');
    }
  }

  static async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetchWithAuth('/transactions/recent');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw new Error('Impossible de récupérer les transactions récentes');
    }
  }

  static async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    try {
      const response = await fetchWithAuth(`/transactions/account/${accountId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      throw new Error('Impossible de récupérer les transactions du compte');
    }
  }

  static async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      const response = await fetchWithAuth('/beneficiaries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      throw new Error('Impossible de récupérer les bénéficiaires');
    }
  }

  static async createTransfer(data: TransferData): Promise<any> {
    try {
      const response = await fetchWithAuth('/transfers', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw new Error('Impossible de réaliser le virement');
    }
  }

  static async addBeneficiary(beneficiary: Omit<Beneficiary, 'id'>): Promise<Beneficiary> {
    try {
      const response = await fetchWithAuth('/beneficiaries', {
        method: 'POST',
        body: JSON.stringify(beneficiary)
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      throw new Error('Impossible d\'ajouter le bénéficiaire');
    }
  }
}
