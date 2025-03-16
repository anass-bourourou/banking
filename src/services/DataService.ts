
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
  category?: string; // Added optional category field
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  date: string;
  read: boolean;
  transactionId?: number;
}

export class DataService {
  static async getAccounts(): Promise<Account[]> {
    try {
      const response = await fetchWithAuth('/accounts');
      const data = await response.json();
      
      // Ensure the response matches the Account[] type
      if (Array.isArray(data) && data.length > 0 && 'balance' in data[0]) {
        return data as Account[];
      }
      
      console.error('Unexpected response format:', data);
      throw new Error('Format de réponse inattendu pour les comptes');
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Impossible de récupérer les comptes');
    }
  }

  static async getAccountById(id: number): Promise<Account | null> {
    try {
      const response = await fetchWithAuth(`/accounts/${id}`);
      const data = await response.json();
      
      // Ensure the response matches the Account type
      if (data && 'id' in data && 'balance' in data) {
        return data as Account;
      } else if (Array.isArray(data) && data.length > 0) {
        // If the API returns an array with one account, take the first one
        const account = data.find(acc => acc.id === id);
        if (account) return account as Account;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      throw new Error('Impossible de récupérer les détails du compte');
    }
  }

  static async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetchWithAuth('/transactions/recent');
      const data = await response.json();
      
      // Ensure the response matches the Transaction[] type
      if (Array.isArray(data) && data.length > 0 && 'description' in data[0]) {
        return data as Transaction[];
      }
      
      console.error('Unexpected response format:', data);
      throw new Error('Format de réponse inattendu pour les transactions');
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw new Error('Impossible de récupérer les transactions récentes');
    }
  }

  static async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    try {
      const response = await fetchWithAuth(`/transactions/account/${accountId}`);
      const data = await response.json();
      
      // Ensure the response matches the Transaction[] type
      if (Array.isArray(data) && data.length > 0 && 'description' in data[0]) {
        return data as Transaction[];
      }
      
      return []; // Return empty array if no transactions
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      throw new Error('Impossible de récupérer les transactions du compte');
    }
  }

  static async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      const response = await fetchWithAuth('/beneficiaries');
      const data = await response.json();
      
      // Ensure the response matches the Beneficiary[] type
      if (Array.isArray(data) && data.length > 0 && 'iban' in data[0]) {
        return data as Beneficiary[];
      }
      
      return []; // Return empty array if no beneficiaries
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
      const data = await response.json();
      
      // Ensure the response includes an id
      if (data && 'id' in data) {
        return data as Beneficiary;
      }
      
      console.error('Unexpected response format:', data);
      throw new Error('Format de réponse inattendu');
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      throw new Error('Impossible d\'ajouter le bénéficiaire');
    }
  }

  static async getNotifications(): Promise<Notification[]> {
    try {
      // First try to fetch notifications from the server
      const response = await fetchWithAuth('/notifications');
      const data = await response.json();
      
      // Validate that the data matches the Notification[] type
      if (Array.isArray(data) && data.length > 0 && 'type' in data[0] && 'read' in data[0]) {
        // Explicitly cast to Notification[] after verifying the structure
        return data as Notification[];
      }
      
      // Fallback: If server doesn't have notifications endpoint or returns empty array,
      // generate notifications based on recent transactions
      return DataService.generateNotificationsFromTransactions();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to generating notifications from transactions
      return DataService.generateNotificationsFromTransactions();
    }
  }
  
  private static async generateNotificationsFromTransactions(): Promise<Notification[]> {
    try {
      // Get recent transactions to generate notifications
      const transactions = await DataService.getRecentTransactions();
      
      if (!transactions || transactions.length === 0) {
        return [];
      }
      
      // Generate notifications based on recent transactions
      const notifications: Notification[] = transactions.slice(0, 3).map((transaction, index) => {
        const isCredit = transaction.type === 'credit';
        return {
          id: `tr-${transaction.id}`,
          title: isCredit ? 'Dépôt reçu' : 'Paiement effectué',
          message: `${isCredit ? 'Réception de' : 'Paiement de'} ${transaction.amount.toLocaleString('fr-FR')}€ - ${transaction.description}`,
          type: 'info',
          date: transaction.date,
          read: false,
          transactionId: transaction.id
        };
      });
      
      // Add a few static notifications for demonstration
      notifications.push({
        id: 'sys-1',
        title: 'Solde faible',
        message: 'Votre compte Épargne atteindra bientôt le seuil minimum',
        type: 'warning',
        date: new Date().toISOString(),
        read: false
      });
      
      notifications.push({
        id: 'sys-2',
        title: 'Maintenance programmée',
        message: 'Une maintenance est prévue ce weekend. Certains services pourraient être indisponibles.',
        type: 'info',
        date: new Date().toISOString(),
        read: true
      });
      
      // Sort by date, newest first
      return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error generating notifications:', error);
      return [];
    }
  }
}
