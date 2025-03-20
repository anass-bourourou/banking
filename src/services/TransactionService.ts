
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { AccountService } from './AccountService';
import { NotificationService } from './NotificationService';
import { SmsValidationService } from './SmsValidationService';
import { TransferReceiptService } from './TransferReceiptService';

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
  transfer_type?: 'standard' | 'instantané' | 'planifié' | 'multiple';
  reference_id?: string;
  fees?: number;
  motif?: string;
}

export interface TransferData {
  fromAccountId: number;
  toAccountId?: number;
  beneficiaryId?: string;
  amount: number;
  motif?: string;
  description?: string; // Added this property for backward compatibility
  isInstant?: boolean;
  scheduledDate?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients?: { id: string; amount: number }[];
  fees?: number;
  smsValidationId?: number;
  validationCode?: string;
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

  static async requestTransferValidation(transferData: TransferData, phoneNumber: string): Promise<{ validationId: number }> {
    try {
      return await SmsValidationService.requestSmsValidation(
        transferData.isInstant ? 'virement_instantané' : 
        transferData.recipients && transferData.recipients.length > 0 ? 'virement_multiple' : 'virement_standard',
        {
          fromAccountId: transferData.fromAccountId,
          amount: transferData.amount,
          beneficiaryId: transferData.beneficiaryId,
          toAccountId: transferData.toAccountId,
          recipients: transferData.recipients
        },
        phoneNumber
      );
    } catch (error) {
      console.error('Error requesting transfer validation:', error);
      throw error;
    }
  }

  static async createTransfer(transferData: TransferData): Promise<any> {
    try {
      // Vérification du code SMS si un ID de validation est fourni
      if (transferData.smsValidationId && transferData.validationCode) {
        const isValid = await SmsValidationService.verifySmsCode(
          transferData.smsValidationId,
          transferData.validationCode
        );
        
        if (!isValid) {
          throw new Error('Code de validation SMS invalide');
        }
      }
      
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const supabase = TransactionService.getSupabase()!;
        
        // 1. Create the transfer record
        const { data: transfer, error: transferError } = await supabase
          .from('transfers')
          .insert({
            from_account_id: transferData.fromAccountId,
            to_account_id: transferData.toAccountId,
            beneficiary_id: transferData.beneficiaryId,
            amount: transferData.amount,
            description: transferData.motif || 'Virement',
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
        if (!transfer) throw new Error('Erreur lors de la création du virement');

        // 2. Update source account balance
        const { data: fromAccount, error: fromAccountError } = await supabase
          .from('accounts')
          .select('balance, phone_number')
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
          description: transferData.motif || 'Virement sortant',
          amount: transferData.amount,
          type: 'debit' as const,
          date: new Date().toISOString(),
          account_id: transferData.fromAccountId,
          recipient_name: null,
          recipient_account: null,
          transfer_type: transferData.isInstant ? 'instantané' : 'standard',
          status: 'completed' as const,
          reference_id: transfer.id.toString(),
          fees: transfer.fees,
          motif: transferData.motif
        };

        const { error: debitError } = await supabase
          .from('transactions')
          .insert(debitTransaction);

        if (debitError) throw debitError;

        // 5. Create a notification
        await NotificationService.addNotification({
          title: 'Virement effectué',
          message: `Virement de ${transferData.amount.toLocaleString('fr-MA')} MAD effectué avec succès.`,
          type: 'info',
        });

        // 6. Generate receipt
        try {
          const recipientDetails = transferData.beneficiaryId ? { id: transferData.beneficiaryId } : { id: transferData.toAccountId };
          await TransferReceiptService.generateTransferReceipt(
            transfer.id,
            transferData.isInstant ? 'instantané' : 'standard',
            transferData.fromAccountId,
            recipientDetails,
            transferData.amount,
            transferData.motif,
            transfer.fees || 0
          );
        } catch (receiptError) {
          console.error('Failed to generate receipt:', receiptError);
          // Continue with the transfer even if receipt generation fails
        }

        // Return success response
        toast.success('Virement effectué avec succès', {
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
            description: transferData.motif
          })
        });
        
        const data = await response.json();
        
        toast.success('Virement effectué avec succès', {
          description: `Montant: ${transferData.amount.toLocaleString('fr-MA')} MAD`
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('Impossible d\'effectuer le virement');
      throw new Error('Impossible d\'effectuer le virement');
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

  // Créer un virement multiple (anciennement virement de masse)
  static async createMassTransfer(transfers: TransferData): Promise<any> {
    try {
      // Vérification du code SMS si un ID de validation est fourni
      if (transfers.smsValidationId && transfers.validationCode) {
        const isValid = await SmsValidationService.verifySmsCode(
          transfers.smsValidationId,
          transfers.validationCode
        );
        
        if (!isValid) {
          throw new Error('Code de validation SMS invalide');
        }
      }

      // Pour la démo, on considère que transfers contient déjà un tableau de bénéficiaires
      if (!transfers.recipients || transfers.recipients.length === 0) {
        throw new Error('Aucun bénéficiaire spécifié pour le virement multiple');
      }

      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        // On traite chaque bénéficiaire comme un transfert individuel
        const results = [];
        for (const recipient of transfers.recipients) {
          const singleTransfer: TransferData = {
            fromAccountId: transfers.fromAccountId,
            beneficiaryId: recipient.id,
            amount: recipient.amount,
            motif: transfers.motif || 'Virement multiple'
          };
          
          const result = await TransactionService.createTransfer(singleTransfer);
          results.push(result);
        }

        // Générer un reçu global pour le virement multiple
        try {
          const totalAmount = transfers.recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
          await TransferReceiptService.generateTransferReceipt(
            results[0].id, // Utilise l'ID du premier transfert comme référence
            'multiple',
            transfers.fromAccountId,
            { recipients: transfers.recipients },
            totalAmount,
            transfers.motif,
            0 // Pas de frais supplémentaires pour les virements multiples
          );
        } catch (receiptError) {
          console.error('Failed to generate mass transfer receipt:', receiptError);
          // Continue with the transfer even if receipt generation fails
        }

        toast.success('Virements multiples effectués', {
          description: `${results.length} virements ont été traités avec succès.`
        });

        return {
          recipientsCount: results.length,
          totalAmount: transfers.recipients.reduce((sum, recipient) => sum + recipient.amount, 0)
        };
      } else {
        // Mock API
        const response = await fetchWithAuth('/mass-transfers', {
          method: 'POST',
          body: JSON.stringify(transfers)
        });

        const data = await response.json();
        
        toast.success('Virements multiples effectués', {
          description: `${transfers.recipients?.length} virements ont été traités avec succès.`
        });
        
        return {
          recipientsCount: transfers.recipients?.length || 0,
          totalAmount: transfers.recipients.reduce((sum, recipient) => sum + recipient.amount, 0)
        };
      }
    } catch (error) {
      console.error('Error creating mass transfers:', error);
      toast.error('Erreur lors des virements multiples');
      throw new Error('Erreur lors des virements multiples');
    }
  }
}
