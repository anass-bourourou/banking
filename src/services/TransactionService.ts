
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  category?: string;
}

export interface TransferData {
  fromAccount: number;
  toAccount: number | string;
  amount: number;
  description?: string;
  isInstant?: boolean;
  isScheduled?: boolean;
  scheduledDate?: string;
  recipients?: Array<{id: string, amount: number}>;
  fees?: number;
}

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
        // Use mock API
        const response = await fetchWithAuth('/transactions/recent');
        const data = await response.json();
        
        // Ensure the response matches the Transaction[] type
        if (Array.isArray(data) && data.length > 0 && 'description' in data[0]) {
          return data as Transaction[];
        }
        
        console.error('Unexpected response format:', data);
        throw new Error('Format de réponse inattendu pour les transactions');
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast.error('Impossible de récupérer les transactions récentes');
      throw new Error('Impossible de récupérer les transactions récentes');
    }
  }

  static async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
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
        // Use mock API
        const response = await fetchWithAuth(`/transactions/account/${accountId}`);
        const data = await response.json();
        
        // Ensure the response matches the Transaction[] type
        if (Array.isArray(data) && data.length > 0 && 'description' in data[0]) {
          return data as Transaction[];
        }
        
        return []; // Return empty array if no transactions
      }
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les transactions du compte');
      throw new Error('Impossible de récupérer les transactions du compte');
    }
  }

  static async createTransfer(data: TransferData): Promise<any> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        // Get the accounts
        const { data: fromAccount, error: fromError } = await TransactionService.getSupabase()!
          .from('accounts')
          .select('*')
          .eq('id', data.fromAccount)
          .single();

        if (fromError) throw fromError;
        if (!fromAccount) throw new Error('Compte source non trouvé');

        // Calculate the total amount with fees if applicable
        const totalAmount = data.amount + (data.fees || 0);

        // Validate sufficient funds
        if (fromAccount.balance < totalAmount) {
          throw new Error('Solde insuffisant pour effectuer ce virement');
        }

        // Start a transaction
        // Note: Supabase doesn't support true transactions in the client library
        // This is a simplified approach

        // 1. Update source account balance
        const { error: updateError } = await TransactionService.getSupabase()!
          .from('accounts')
          .update({ 
            balance: fromAccount.balance - totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.fromAccount);

        if (updateError) throw updateError;

        // 2. Record the transaction
        const { data: transaction, error: transactionError } = await TransactionService.getSupabase()!
          .from('transactions')
          .insert({
            description: data.description || (data.isInstant ? 'Virement instantané' : 'Virement'),
            amount: data.amount,
            type: 'debit',
            date: new Date().toLocaleDateString('fr-FR'),
            account_id: data.fromAccount,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // 3. Record the fees transaction if applicable
        if (data.fees && data.fees > 0) {
          const { error: feesError } = await TransactionService.getSupabase()!
            .from('transactions')
            .insert({
              description: 'Frais de virement instantané',
              amount: data.fees,
              type: 'debit',
              date: new Date().toLocaleDateString('fr-FR'),
              account_id: data.fromAccount,
              category: 'Frais bancaires',
              created_at: new Date().toISOString()
            });

          if (feesError) throw feesError;
        }

        // 4. Create a notification for the transfer
        await TransactionService.getSupabase()!
          .from('notifications')
          .insert({
            title: data.isInstant ? 'Virement instantané effectué' : 'Virement effectué',
            message: `Virement de ${data.amount.toLocaleString('fr-MA')} MAD effectué avec succès.`,
            type: 'info',
            date: new Date().toISOString(),
            read: false,
            user_id: fromAccount.user_id,
            transaction_id: transaction?.id
          });

        return {
          success: true,
          transferId: transaction?.id,
          date: new Date().toLocaleDateString('fr-FR'),
          status: 'completed',
          isInstant: data.isInstant,
          ...data
        };
      } else {
        // Use mock API
        const response = await fetchWithAuth('/transfers', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return await response.json();
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('Impossible de réaliser le virement');
      throw new Error('Impossible de réaliser le virement');
    }
  }

  static async createMassTransfer(data: TransferData): Promise<any> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        // Implemention of mass transfer logic
        const { data: fromAccount, error: fromError } = await TransactionService.getSupabase()!
          .from('accounts')
          .select('*')
          .eq('id', data.fromAccount)
          .single();

        if (fromError) throw fromError;
        if (!fromAccount) throw new Error('Compte source non trouvé');

        // Calculate total amount for all recipients
        let totalAmount = 0;
        if (data.recipients && data.recipients.length > 0) {
          totalAmount = data.recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
        } else {
          totalAmount = data.amount;
        }

        // Add fees if applicable
        if (data.fees) {
          totalAmount += data.fees;
        }

        // Validate sufficient funds
        if (fromAccount.balance < totalAmount) {
          throw new Error('Solde insuffisant pour effectuer ces virements');
        }

        // Update source account balance
        const { error: updateError } = await TransactionService.getSupabase()!
          .from('accounts')
          .update({ 
            balance: fromAccount.balance - totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.fromAccount);

        if (updateError) throw updateError;

        // Create a transaction record
        const { data: transaction, error: transactionError } = await TransactionService.getSupabase()!
          .from('transactions')
          .insert({
            description: 'Virement de masse',
            amount: data.recipients ? totalAmount - (data.fees || 0) : data.amount,
            type: 'debit',
            date: new Date().toLocaleDateString('fr-FR'),
            account_id: data.fromAccount,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Record fees transaction if applicable
        if (data.fees && data.fees > 0) {
          const { error: feesError } = await TransactionService.getSupabase()!
            .from('transactions')
            .insert({
              description: 'Frais de virement de masse',
              amount: data.fees,
              type: 'debit',
              date: new Date().toLocaleDateString('fr-FR'),
              account_id: data.fromAccount,
              category: 'Frais bancaires',
              created_at: new Date().toISOString()
            });

          if (feesError) throw feesError;
        }

        // Create notification
        await TransactionService.getSupabase()!
          .from('notifications')
          .insert({
            title: 'Virements multiples effectués',
            message: `Virement de masse de ${(totalAmount - (data.fees || 0)).toLocaleString('fr-MA')} MAD effectué avec succès.`,
            type: 'info',
            date: new Date().toISOString(),
            read: false,
            user_id: fromAccount.user_id,
            transaction_id: transaction?.id
          });

        return {
          success: true,
          transferId: transaction?.id,
          date: new Date().toLocaleDateString('fr-FR'),
          status: 'completed',
          totalAmount: totalAmount - (data.fees || 0),
          recipientsCount: data.recipients?.length || 1
        };
      } else {
        // Use mock API
        const response = await fetchWithAuth('/mass-transfers', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return await response.json();
      }
    } catch (error) {
      console.error('Error creating mass transfer:', error);
      toast.error('Impossible de réaliser les virements de masse');
      throw new Error('Impossible de réaliser les virements de masse');
    }
  }
}
