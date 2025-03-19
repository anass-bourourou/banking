
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { AccountService } from './AccountService';
import { NotificationService } from './NotificationService';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
  recipient_name?: string;
  recipient_account?: string;
  transfer_type?: 'standard' | 'instant' | 'scheduled' | 'mass';
  reference_id?: string;
  fees?: number;
}

export interface TransferData {
  fromAccountId: number;
  toAccountId?: number;
  beneficiaryId?: string;
  amount: number;
  description?: string;
  isInstant?: boolean;
  scheduledDate?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients?: { id: string; amount: number }[];
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
        
        if (Array.isArray(data) && data.length > 0 && 'amount' in data[0]) {
          return data as Transaction[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast.error('Impossible de récupérer les transactions récentes');
      throw new Error('Impossible de récupérer les transactions récentes');
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
        // Use mock API
        const response = await fetchWithAuth(`/transactions/account/${accountId}`);
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          return data as Transaction[];
        }
        
        return [];
      }
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      toast.error('Impossible de récupérer les transactions du compte');
      throw new Error('Impossible de récupérer les transactions du compte');
    }
  }

  static async createTransfer(transferData: TransferData): Promise<any> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const supabase = TransactionService.getSupabase()!;
        
        // Start a transaction to update multiple tables atomically
        // Note: For real implementation, you would use a database function or transaction

        // 1. Create the transfer record
        const { data: transfer, error: transferError } = await supabase
          .from('transfers')
          .insert({
            from_account_id: transferData.fromAccountId,
            to_account_id: transferData.toAccountId,
            beneficiary_id: transferData.beneficiaryId,
            amount: transferData.amount,
            description: transferData.description || 'Transfert',
            date: new Date().toISOString(),
            scheduled_date: transferData.scheduledDate,
            is_instant: transferData.isInstant || false,
            is_recurring: transferData.isRecurring || false,
            recurring_frequency: transferData.recurringFrequency,
            status: 'completed',
            fees: transferData.isInstant ? transferData.amount * 0.01 : 0, // 1% fee for instant transfers
          })
          .select()
          .single();

        if (transferError) throw transferError;
        if (!transfer) throw new Error('Erreur lors de la création du transfert');

        // 2. Update source account balance
        const { data: fromAccount, error: fromAccountError } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transferData.fromAccountId)
          .single();

        if (fromAccountError) throw fromAccountError;
        if (!fromAccount) throw new Error('Compte source non trouvé');

        const totalDeduction = transferData.amount + (transfer.fees || 0);
        const newFromBalance = fromAccount.balance - totalDeduction;

        const { error: updateFromError } = await supabase
          .from('accounts')
          .update({ balance: newFromBalance })
          .eq('id', transferData.fromAccountId);

        if (updateFromError) throw updateFromError;

        // 3. If it's an internal transfer (to another account), update destination account balance
        if (transferData.toAccountId) {
          const { data: toAccount, error: toAccountError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', transferData.toAccountId)
            .single();

          if (toAccountError) throw toAccountError;
          if (!toAccount) throw new Error('Compte destinataire non trouvé');

          const newToBalance = toAccount.balance + transferData.amount;

          const { error: updateToError } = await supabase
            .from('accounts')
            .update({ balance: newToBalance })
            .eq('id', transferData.toAccountId);

          if (updateToError) throw updateToError;
        }

        // 4. Create transaction records
        const debitTransaction = {
          description: transferData.description || 'Transfert sortant',
          amount: transferData.amount,
          type: 'debit' as const,
          date: new Date().toISOString(),
          account_id: transferData.fromAccountId,
          recipient_name: null,
          recipient_account: null,
          transfer_type: transferData.isInstant ? 'instant' : 'standard',
          status: 'completed' as const,
          reference_id: transfer.id.toString(),
          fees: transfer.fees,
        };

        const { error: debitError } = await supabase
          .from('transactions')
          .insert(debitTransaction);

        if (debitError) throw debitError;

        // 5. Create a notification
        await NotificationService.addNotification({
          title: 'Transfert effectué',
          message: `Transfert de ${transferData.amount.toLocaleString('fr-MA')} MAD effectué avec succès.`,
          type: 'info',
        });

        // Return success response
        toast.success('Transfert effectué avec succès', {
          description: `Montant: ${transferData.amount.toLocaleString('fr-MA')} MAD`
        });

        return transfer;
      } else {
        // Use mock API
        const response = await fetchWithAuth('/transfers', {
          method: 'POST',
          body: JSON.stringify({
            fromAccountId: transferData.fromAccountId,
            toAccountId: transferData.toAccountId || transferData.beneficiaryId,
            amount: transferData.amount,
            description: transferData.description
          })
        });
        
        const data = await response.json();
        
        toast.success('Transfert effectué avec succès', {
          description: `Montant: ${transferData.amount.toLocaleString('fr-MA')} MAD`
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('Impossible d\'effectuer le transfert');
      throw new Error('Impossible d\'effectuer le transfert');
    }
  }

  // Utilitaire pour mettre à jour le solde du compte après une transaction
  static async updateAccountBalance(accountId: number, amount: number, isCredit: boolean): Promise<void> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        // Récupérer le solde actuel
        const { data: account, error: accountError } = await TransactionService.getSupabase()!
          .from('accounts')
          .select('balance')
          .eq('id', accountId)
          .single();

        if (accountError) throw accountError;
        if (!account) throw new Error('Compte non trouvé');

        // Calculer le nouveau solde
        const newBalance = isCredit 
          ? account.balance + amount 
          : account.balance - amount;

        // Mettre à jour le solde
        const { error: updateError } = await TransactionService.getSupabase()!
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', accountId);

        if (updateError) throw updateError;

        // Mettre à jour l'historique du compte (si le mois est différent)
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('fr-FR', { month: 'long' });
        const currentYear = currentDate.getFullYear();
        const currentMonthKey = `${currentMonth} ${currentYear}`;

        // Vérifier si une entrée existe déjà pour ce mois
        const { data: historyData, error: historyError } = await TransactionService.getSupabase()!
          .from('account_history')
          .select('*')
          .eq('account_id', accountId)
          .eq('month', currentMonthKey);

        if (historyError) throw historyError;

        if (historyData && historyData.length > 0) {
          // Mettre à jour l'entrée existante
          const { error: updateHistoryError } = await TransactionService.getSupabase()!
            .from('account_history')
            .update({ amount: newBalance })
            .eq('id', historyData[0].id);

          if (updateHistoryError) throw updateHistoryError;
        } else {
          // Créer une nouvelle entrée
          const { error: insertHistoryError } = await TransactionService.getSupabase()!
            .from('account_history')
            .insert({
              account_id: accountId,
              month: currentMonthKey,
              amount: newBalance
            });

          if (insertHistoryError) throw insertHistoryError;
        }
      }
    } catch (error) {
      console.error('Error updating account balance:', error);
      throw error;
    }
  }

  // Créer une masse de virements
  static async createMassTransfer(transfers: TransferData): Promise<any> {
    try {
      // Pour la démo, on considère que transfers contient déjà un tableau de bénéficiaires
      if (!transfers.recipients || transfers.recipients.length === 0) {
        throw new Error('Aucun bénéficiaire spécifié pour le virement en masse');
      }

      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        // On traite chaque bénéficiaire comme un transfert individuel
        const results = [];
        for (const recipient of transfers.recipients) {
          const singleTransfer: TransferData = {
            fromAccountId: transfers.fromAccountId,
            beneficiaryId: recipient.id,
            amount: recipient.amount,
            description: transfers.description || 'Virement de masse'
          };
          
          const result = await TransactionService.createTransfer(singleTransfer);
          results.push(result);
        }

        toast.success('Virements en masse effectués', {
          description: `${results.length} virements ont été traités avec succès.`
        });

        return {
          recipientsCount: results.length,
          totalAmount: transfers.amount
        };
      } else {
        // Mock API
        const response = await fetchWithAuth('/mass-transfers', {
          method: 'POST',
          body: JSON.stringify(transfers)
        });

        const data = await response.json();
        
        toast.success('Virements en masse effectués', {
          description: `${transfers.recipients?.length} virements ont été traités avec succès.`
        });
        
        return {
          recipientsCount: transfers.recipients?.length || 0,
          totalAmount: transfers.amount
        };
      }
    } catch (error) {
      console.error('Error creating mass transfers:', error);
      toast.error('Erreur lors des virements en masse');
      throw new Error('Erreur lors des virements en masse');
    }
  }
}
