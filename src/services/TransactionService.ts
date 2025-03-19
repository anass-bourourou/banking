
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
  recipient_name?: string;
  recipient_account?: string;
  transfer_type?: 'standard' | 'instant' | 'scheduled' | 'mass';
  status: 'completed' | 'pending' | 'failed';
  reference_id?: string;
  fees?: number;
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
        
        return data as Transaction[] || [];
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
        // 1. Create a transfer record
        const { data: transfer, error: transferError } = await TransactionService.getSupabase()!
          .from('transfers')
          .insert({
            from_account_id: data.fromAccount,
            beneficiary_id: typeof data.toAccount === 'string' ? data.toAccount : undefined,
            to_account_id: typeof data.toAccount === 'number' ? data.toAccount : undefined,
            amount: data.amount,
            description: data.description,
            date: new Date().toISOString(),
            scheduled_date: data.scheduledDate,
            is_instant: data.isInstant || false,
            is_recurring: false,
            status: 'completed',
            fees: data.fees,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (transferError) throw transferError;

        // 2. Update source account balance
        const { error: updateError } = await TransactionService.getSupabase()!
          .from('accounts')
          .update({ 
            balance: fromAccount.balance - totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.fromAccount);

        if (updateError) throw updateError;

        // 3. Record the transaction
        const { data: transaction, error: transactionError } = await TransactionService.getSupabase()!
          .from('transactions')
          .insert({
            description: data.description || (data.isInstant ? 'Virement instantané' : 'Virement'),
            amount: data.amount,
            type: 'debit',
            date: new Date().toISOString(),
            account_id: data.fromAccount,
            transfer_type: data.isInstant ? 'instant' : 'standard',
            status: 'completed',
            reference_id: transfer?.id.toString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // 4. Record the fees transaction if applicable
        if (data.fees && data.fees > 0) {
          const { error: feesError } = await TransactionService.getSupabase()!
            .from('transactions')
            .insert({
              description: 'Frais de virement instantané',
              amount: data.fees,
              type: 'debit',
              date: new Date().toISOString(),
              account_id: data.fromAccount,
              category: 'Frais bancaires',
              transfer_type: 'instant',
              status: 'completed',
              reference_id: transfer?.id.toString(),
              created_at: new Date().toISOString()
            });

          if (feesError) throw feesError;
        }

        // 5. Create a notification for the transfer
        await TransactionService.getSupabase()!
          .from('notifications')
          .insert({
            title: data.isInstant ? 'Virement instantané effectué' : 'Virement effectué',
            message: `Virement de ${data.amount.toLocaleString('fr-MA')} MAD effectué avec succès.`,
            type: 'info',
            date: new Date().toISOString(),
            read: false,
            user_id: fromAccount.user_id,
            transaction_id: transaction?.id,
            transfer_id: transfer?.id
          });

        return {
          success: true,
          transferId: transfer?.id,
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
        // Implementation of mass transfer logic
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

        // Create a master transfer record
        const { data: masterTransfer, error: masterTransferError } = await TransactionService.getSupabase()!
          .from('transfers')
          .insert({
            from_account_id: data.fromAccount,
            amount: totalAmount - (data.fees || 0),
            description: 'Virement de masse',
            date: new Date().toISOString(),
            is_instant: false,
            is_recurring: false,
            status: 'completed',
            fees: data.fees,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (masterTransferError) throw masterTransferError;

        // Update source account balance
        const { error: updateError } = await TransactionService.getSupabase()!
          .from('accounts')
          .update({ 
            balance: fromAccount.balance - totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.fromAccount);

        if (updateError) throw updateError;

        // Process each recipient
        if (data.recipients && data.recipients.length > 0) {
          for (const recipient of data.recipients) {
            const { error: transferError } = await TransactionService.getSupabase()!
              .from('transfers')
              .insert({
                from_account_id: data.fromAccount,
                beneficiary_id: recipient.id,
                amount: recipient.amount,
                description: data.description || 'Virement de masse',
                date: new Date().toISOString(),
                is_instant: false,
                is_recurring: false,
                status: 'completed',
                created_at: new Date().toISOString()
              });

            if (transferError) throw transferError;
          }
        }

        // Create a transaction record for the total mass transfer
        const { data: transaction, error: transactionError } = await TransactionService.getSupabase()!
          .from('transactions')
          .insert({
            description: 'Virement de masse',
            amount: totalAmount - (data.fees || 0),
            type: 'debit',
            date: new Date().toISOString(),
            account_id: data.fromAccount,
            transfer_type: 'mass',
            status: 'completed',
            reference_id: masterTransfer?.id.toString(),
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
              date: new Date().toISOString(),
              account_id: data.fromAccount,
              category: 'Frais bancaires',
              transfer_type: 'mass',
              status: 'completed',
              reference_id: masterTransfer?.id.toString(),
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
            transaction_id: transaction?.id,
            transfer_id: masterTransfer?.id
          });

        return {
          success: true,
          transferId: masterTransfer?.id,
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
