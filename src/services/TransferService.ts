
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Transaction, TransferData } from '@/types/transaction';

export type { TransferData } from '@/types/transaction';

export class TransferService extends BaseService {
  static async createTransfer(transferData: TransferData): Promise<Transaction> {
    try {
      if (TransferService.useSupabase() && TransferService.getSupabase()) {
        // Map the transferType to the display value used in the UI
        let displayTransferType: string;
        switch(transferData.transferType) {
          case 'instant':
            displayTransferType = 'instantané';
            break;
          case 'mass':
            displayTransferType = 'multiple';
            break;
          default:
            displayTransferType = transferData.transferType || 'standard';
        }

        const transactionData = {
          description: transferData.description || 'Virement',
          amount: transferData.amount,
          type: 'debit',
          date: new Date().toISOString(),
          account_id: transferData.fromAccountId,
          recipient_account: typeof transferData.toAccount === 'string' ? transferData.toAccount : String(transferData.toAccount),
          recipient_name: transferData.recipientName,
          transfer_type: displayTransferType,
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

        // Update account balance
        await TransferService.updateAccountBalance(transferData);

        toast.success('Virement effectué avec succès', {
          description: `Un virement de ${transferData.amount} MAD a été effectué`
        });

        return data;
      } else {
        const response = await fetchWithAuth('/api/transfers', {
          method: 'POST',
          body: JSON.stringify(transferData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la création du virement');
        }
        
        const data = await response.json();
        
        toast.success('Virement effectué avec succès', {
          description: `Un virement de ${transferData.amount} MAD a été effectué`
        });
        
        return data as Transaction;
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
        
        // Create a transaction for each recipient
        if (transferData.recipients && transferData.recipients.length > 0) {
          const transactions = transferData.recipients.map(recipient => ({
            description: transferData.description || `Virement multiple - ${recipient.id}`,
            amount: recipient.amount,
            type: 'debit',
            date: new Date().toISOString(),
            account_id: transferData.fromAccountId,
            recipient_account: recipient.id,
            transfer_type: 'multiple',
            status: 'completed',
            reference_id: `TR-MASS-${Date.now()}-${recipient.id}`
          }));
          
          const { error } = await TransferService.getSupabase()!
            .from('transactions')
            .insert(transactions);
            
          if (error) throw error;
        }
        
        // Update account balance
        await TransferService.updateAccountBalance(transferData);
        
        toast.success('Virements multiples effectués avec succès', {
          description: `${recipientsCount} virements pour un total de ${totalAmount.toLocaleString('fr-MA')} MAD`
        });
        
        return { recipientsCount, totalAmount };
      } else {
        const response = await fetchWithAuth('/api/transfers/mass', {
          method: 'POST',
          body: JSON.stringify(transferData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la création des virements multiples');
        }
        
        const data = await response.json();
        
        toast.success('Virements multiples effectués avec succès', {
          description: `${data.recipientsCount || 0} virements pour un total de ${data.totalAmount?.toLocaleString('fr-MA') || 0} MAD`
        });
        
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
  
  private static async updateAccountBalance(transferData: TransferData): Promise<void> {
    try {
      if (!TransferService.useSupabase() || !TransferService.getSupabase()) {
        return; // Skip if not using Supabase
      }
      
      // Get current account balance
      const { data: accountData, error: accountError } = await TransferService.getSupabase()!
        .from('accounts')
        .select('balance')
        .eq('id', transferData.fromAccountId)
        .single();
        
      if (accountError) throw accountError;
      if (!accountData) throw new Error('Compte non trouvé');
      
      // Calculate total amount to deduct
      let totalAmount = 0;
      if (transferData.recipients && transferData.recipients.length > 0) {
        totalAmount = transferData.recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
      } else {
        totalAmount = transferData.amount;
      }
      
      // Add fees if applicable
      if (transferData.fees && transferData.fees > 0) {
        totalAmount += transferData.fees;
      }
      
      const newBalance = accountData.balance - totalAmount;
      
      // Update account balance
      const { error: updateError } = await TransferService.getSupabase()!
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', transferData.fromAccountId);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating account balance:', error);
      throw error;
    }
  }
}
