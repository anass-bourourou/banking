
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Account } from './AccountService';
import { TransactionService } from './TransactionService';
import { NotificationService } from './NotificationService';
import { SmsValidationService } from './SmsValidationService';

export interface Bill {
  id: string;
  reference: string;
  type: 'DGI' | 'CIM' | 'OTHER';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  description: string;
  user_id?: string;
}

export class BillService extends BaseService {
  static async getMoroccanBills(): Promise<Bill[]> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        const { data, error } = await BillService.getSupabase()!
          .from('bills')
          .select('*')
          .order('dueDate', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Use mock API
        const response = await fetchWithAuth('/moroccan-bills');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          return data as Bill[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching Moroccan bills:', error);
      toast.error('Impossible de récupérer les factures');
      throw new Error('Impossible de récupérer les factures');
    }
  }

  static async payBill(
    billId: string, 
    accountId: number, 
    validationCode?: string, 
    validationId?: number | null
  ): Promise<void> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        const supabase = BillService.getSupabase()!;
        
        // Vérifier le code OTP si fourni
        if (validationId && validationCode) {
          const isValid = await SmsValidationService.verifySmsCode(
            validationId,
            validationCode
          );
          
          if (!isValid) {
            throw new Error('Code de validation SMS invalide');
          }
        }
        
        // Get bill details
        const { data: bill, error: billError } = await supabase
          .from('bills')
          .select('*')
          .eq('id', billId)
          .single();

        if (billError) throw billError;
        if (!bill) throw new Error('Facture non trouvée');

        // Get account details
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', accountId)
          .single();

        if (accountError) throw accountError;
        if (!account) throw new Error('Compte non trouvé');

        // Check sufficient balance
        if (account.balance < bill.amount) {
          throw new Error('Solde insuffisant pour effectuer ce paiement');
        }

        // Update bill status
        const { error: updateBillError } = await supabase
          .from('bills')
          .update({ 
            status: 'paid',
            paymentDate: new Date().toISOString()
          })
          .eq('id', billId);

        if (updateBillError) throw updateBillError;

        // Deduct amount from account
        const newBalance = account.balance - bill.amount;
        const { error: updateAccountError } = await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', accountId);

        if (updateAccountError) throw updateAccountError;

        // Create transaction record
        const transaction = {
          description: `Paiement ${bill.type}: ${bill.description}`,
          amount: bill.amount,
          type: 'debit' as const,
          date: new Date().toISOString(),
          account_id: accountId,
          status: 'completed' as const,
          category: 'bills',
          reference_id: bill.reference
        };

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(transaction);

        if (transactionError) throw transactionError;

        // Create notification
        await NotificationService.addNotification({
          title: 'Facture payée',
          message: `Votre facture ${bill.type} de ${bill.amount.toLocaleString('fr-MA')} MAD a été payée avec succès.`,
          type: 'info'
        });

        toast.success('Paiement réussi', {
          description: `Facture ${bill.reference} payée avec succès`
        });
      } else {
        // Mock API
        await fetchWithAuth(`/bills/${billId}/pay`, {
          method: 'POST',
          body: JSON.stringify({ accountId, validationCode, validationId })
        });
        
        toast.success('Paiement réussi', {
          description: `Facture payée avec succès`
        });
      }
    } catch (error) {
      console.error('Error paying bill:', error);
      toast.error('Erreur lors du paiement', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
      throw error;
    }
  }
}
