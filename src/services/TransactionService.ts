
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Transaction } from '@/types/transaction';

export class TransactionService extends BaseService {
  static async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const { data, error } = await TransactionService.getSupabase()!
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } else {
        // Use backend API
        const response = await fetchWithAuth(`/api/transactions/recent?limit=${limit}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la récupération des transactions');
        }
        
        const data = await response.json();
        return data as Transaction[];
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast.error('Impossible de récupérer les transactions récentes');
      return [];
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
        // Use backend API
        const response = await fetchWithAuth(`/api/accounts/${accountId}/transactions`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la récupération des transactions');
        }
        
        const data = await response.json();
        return data as Transaction[];
      }
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les transactions du compte');
      return [];
    }
  }

  static async getTransactionById(id: number | string): Promise<Transaction | null> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const { data, error } = await TransactionService.getSupabase()!
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } else {
        // Use backend API
        const response = await fetchWithAuth(`/api/transactions/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la récupération de la transaction');
        }
        
        const data = await response.json();
        return data as Transaction;
      }
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      toast.error('Impossible de récupérer les détails de la transaction');
      return null;
    }
  }
  
  static async filterTransactions(
    filters: { 
      accountId?: number; 
      type?: 'credit' | 'debit'; 
      dateFrom?: string; 
      dateTo?: string;
      category?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ): Promise<Transaction[]> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        let query = TransactionService.getSupabase()!
          .from('transactions')
          .select('*');
          
        if (filters.accountId) {
          query = query.eq('account_id', filters.accountId);
        }
        
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        
        if (filters.dateFrom) {
          query = query.gte('date', filters.dateFrom);
        }
        
        if (filters.dateTo) {
          query = query.lte('date', filters.dateTo);
        }
        
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount);
        }
        
        query = query.order('date', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } else {
        // Use backend API - convert filters to query params
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        
        const response = await fetchWithAuth(`/api/transactions/filter?${params.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la recherche des transactions');
        }
        
        const data = await response.json();
        return data as Transaction[];
      }
    } catch (error) {
      console.error('Error filtering transactions:', error);
      toast.error('Impossible de filtrer les transactions');
      return [];
    }
  }
}
