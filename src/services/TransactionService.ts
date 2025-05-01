
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Transaction } from '@/types/transaction';
import { ENDPOINTS } from '@/config/api.config';

export class TransactionService extends BaseService {
  static async getRecentTransactions(): Promise<Transaction[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(ENDPOINTS.TRANSACTIONS.RECENT);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des transactions');
      }
      
      const data = await response.json();
      return data as Transaction[];
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast.error('Impossible de récupérer les transactions récentes');
      return [];
    }
  }

  static async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`${ENDPOINTS.ACCOUNTS.DETAIL(accountId)}/transactions`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des transactions');
      }
      
      const data = await response.json();
      return data as Transaction[];
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les transactions du compte');
      return [];
    }
  }
}
