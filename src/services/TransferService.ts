
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Transaction, TransferData } from '@/types/transaction';

export type { TransferData } from '@/types/transaction';

export class TransferService extends BaseService {
  static async createTransfer(transferData: TransferData): Promise<Transaction> {
    try {
      if (TransferService.useSupabase() && TransferService.getSupabase()) {
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

        const { data, error } = await TransferService.getSupabase()!
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
        const response = await fetchWithAuth('/transfers/create', {
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
      if (TransferService.useSupabase() && TransferService.getSupabase()) {
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
}
