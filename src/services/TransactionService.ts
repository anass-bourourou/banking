
import { BaseService } from './BaseService';
import { fetchWithAuth, Transaction } from './api';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

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
        // Utiliser l'API backend
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
        // Utiliser l'API backend
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

  static async createTransfer(transferData: {
    fromAccountId: number;
    toAccount: string | number;
    amount: number;
    description?: string;
    transferType?: 'standard' | 'instant' | 'mass';
    recipientName?: string;
    validationCode?: string;
    validationId?: number;
  }): Promise<Transaction> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        // Format data for Supabase
        const transactionData = {
          description: transferData.description || 'Virement',
          amount: transferData.amount,
          type: 'debit',
          date: new Date().toISOString(),
          account_id: transferData.fromAccountId,
          recipient_account: typeof transferData.toAccount === 'string' ? transferData.toAccount : String(transferData.toAccount),
          recipient_name: transferData.recipientName,
          transfer_type: transferData.transferType || 'standard',
          status: 'completed',
          reference_id: `TR-${Date.now()}`
        };

        const { data, error } = await TransactionService.getSupabase()!
          .from('transactions')
          .insert(transactionData)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de la création du virement');

        toast.success('Virement effectué avec succès', {
          description: `Un virement de ${transferData.amount} MAD a été effectué`
        });

        return data;
      } else {
        // Utiliser l'API backend
        const response = await fetchWithAuth(ENDPOINTS.TRANSACTIONS.CREATE, {
          method: 'POST',
          body: JSON.stringify(transferData)
        });
        const data = await response.json();
        
        if (data && data.id) {
          toast.success('Virement effectué avec succès', {
            description: `Un virement de ${transferData.amount} MAD a été effectué`
          });
          return data as Transaction;
        }
        
        throw new Error('Erreur lors de la création du virement');
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('Erreur lors du virement', {
        description: 'Impossible de réaliser le virement'
      });
      throw error;
    }
  }
}
