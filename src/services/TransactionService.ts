import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

export interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  account_id?: number;
  category?: string;
  recipient_account?: string;
  recipient_name?: string;
  transfer_type?: 'standard' | 'instant' | 'mass';
  status: 'completed' | 'pending' | 'failed';
  reference_id?: string;
  fees?: number;
}

export interface TransferData {
  fromAccountId: number;
  toAccount?: string | number;
  beneficiaryId?: string;
  amount: number;
  motif?: string;
  description?: string;
  transferType?: 'standard' | 'instant' | 'mass';
  recipients?: Array<{id: string, amount: number}>;
  isInstant?: boolean;
  fees?: number;
  smsValidationId?: number;
  validationCode?: string;
  recipientName?: string;
  scheduledDate?: string;
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

  static async createTransfer(transferData: TransferData): Promise<Transaction> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
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
  
  static async createMassTransfer(transferData: TransferData): Promise<{recipientsCount: number, totalAmount: number}> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const recipientsCount = transferData.recipients?.length || 0;
        const totalAmount = transferData.amount;
        
        toast.success('Virements multiples effectués avec succès', {
          description: `${recipientsCount} virements pour un total de ${totalAmount.toLocaleString('fr-MA')} MAD`
        });
        
        return { recipientsCount, totalAmount };
      } else {
        const response = await fetchWithAuth('/transfers/mass', {
          method: 'POST',
          body: JSON.stringify(transferData)
        });
        
        const data = await response.json();
        
        if (!data || !data.success) {
          throw new Error('Erreur lors de la création des virements multiples');
        }
        
        return {
          recipientsCount: data.recipientsCount || transferData.recipients?.length || 0,
          totalAmount: data.totalAmount || transferData.amount
        };
      }
    } catch (error) {
      console.error('Error creating mass transfer:', error);
      toast.error('Erreur lors des virements multiples');
      throw error;
    }
  }
  
  static async requestTransferValidation(
    transferData: TransferData, 
    phoneNumber: string
  ): Promise<{validationId: number}> {
    try {
      if (TransactionService.useSupabase() && TransactionService.getSupabase()) {
        const validationData = {
          code: Math.floor(100000 + Math.random() * 900000).toString(),
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          isUsed: false,
          operationType: 'transfer',
          transferData: JSON.stringify(transferData)
        };

        const { data, error } = await TransactionService.getSupabase()!
          .from('sms_validations')
          .insert(validationData)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de la création du code de validation');
        
        console.log(`[DEVELOPMENT] SMS code for transfer: ${validationData.code}`);
        toast.info('Code de validation envoyé', {
          description: 'Un code de validation a été envoyé par SMS'
        });

        return { validationId: data.id };
      } else {
        const response = await fetchWithAuth('/transfers/validate', {
          method: 'POST',
          body: JSON.stringify({ transferData, phoneNumber })
        });
        const data = await response.json();
        
        if (data && data.validationId) {
          toast.info('Code de validation envoyé', {
            description: 'Un code de validation a été envoyé par SMS'
          });
          return { validationId: data.validationId };
        }
        
        throw new Error('Erreur lors de la demande de code SMS');
      }
    } catch (error) {
      console.error('Error requesting transfer validation:', error);
      toast.error('Erreur d\'envoi du SMS');
      throw error;
    }
  }
}
