
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';
import { Transaction } from '@/types/transaction';

export class TransactionService extends BaseService {
  static async getRecentTransactions(): Promise<Transaction[]> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const { data, error } = await TransactionService.getSupabase()!
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);

        if (error) throw error;
        return data || [];
      } else {
        const response = await fetchWithAuth(ENDPOINTS.TRANSACTIONS.RECENT);
        const data = await response.json();

        if (Array.isArray(data)) {
          return data as Transaction[];
        }

        return [];
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Impossible de récupérer les transactions');
      throw new Error('Impossible de récupérer les transactions');
    }
  }

  static async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const { data, error } = await TransactionService.getSupabase()!
          .from('transactions')
          .select('*')
          .eq('account_id', accountId)
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        const response = await fetchWithAuth(ENDPOINTS.TRANSACTIONS.BY_ACCOUNT(accountId));
        const data = await response.json();

        if (Array.isArray(data)) {
          return data as Transaction[];
        }

        return [];
      }
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les transactions');
      throw new Error('Impossible de récupérer les transactions');
    }
  }
}
