
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { TransactionService } from './TransactionService';

export interface Bill {
  id: string;
  reference: string;
  type: 'DGI' | 'CIM' | 'OTHER';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  description: string;
  user_id: string;
  created_at: string;
}

export class BillService extends BaseService {
  static async getBills(): Promise<Bill[]> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        const { data, error } = await BillService.getSupabase()!
          .from('bills')
          .select('*')
          .order('dueDate', { ascending: true });

        if (error) throw error;
        return data || [];
      } else {
        // Mock data for demo
        return [
          {
            id: 'bill-1',
            reference: 'EDF-230930',
            type: 'OTHER',
            amount: 728.50,
            dueDate: '2023-10-25',
            status: 'pending',
            description: 'EDF Électricité',
            user_id: 'user-1',
            created_at: '2023-10-01T10:00:00Z'
          },
          {
            id: 'bill-2',
            reference: 'TEL-231105',
            type: 'OTHER',
            amount: 399.99,
            dueDate: '2023-11-05',
            status: 'pending',
            description: 'Orange Télécom',
            user_id: 'user-1',
            created_at: '2023-10-05T14:30:00Z'
          },
          {
            id: 'bill-3',
            reference: 'ASS-231115',
            type: 'OTHER',
            amount: 653.00,
            dueDate: '2023-11-15',
            status: 'pending',
            description: 'Assurance Auto',
            user_id: 'user-1',
            created_at: '2023-10-10T09:15:00Z'
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Impossible de récupérer les factures');
      throw new Error('Impossible de récupérer les factures');
    }
  }

  static async payBill(billId: string, accountId: number): Promise<void> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        const supabase = BillService.getSupabase()!;
        
        // 1. Get the bill
        const { data: bill, error: billError } = await supabase
          .from('bills')
          .select('*')
          .eq('id', billId)
          .single();

        if (billError) throw billError;
        if (!bill) throw new Error('Facture non trouvée');
        if (bill.status === 'paid') throw new Error('Cette facture a déjà été payée');

        // 2. Update the bill status
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
          .from('bills')
          .update({
            status: 'paid',
            paymentDate: now
          })
          .eq('id', billId);

        if (updateError) throw updateError;

        // 3. Update account balance
        await TransactionService.updateAccountBalance(accountId, bill.amount, false);

        // 4. Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            account_id: accountId,
            description: `Paiement facture: ${bill.description}`,
            amount: bill.amount,
            type: 'debit',
            date: now,
            status: 'completed',
            category: 'Facture',
            reference_id: bill.reference
          });

        if (transactionError) throw transactionError;

        toast.success('Facture payée avec succès', {
          description: `Paiement de ${bill.amount.toLocaleString('fr-MA')} MAD pour ${bill.description}`
        });
      } else {
        // Just simulate success for mock
        toast.success('Facture payée avec succès', {
          description: `Le paiement a été effectué`
        });
      }
    } catch (error) {
      console.error('Error paying bill:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de payer la facture';
      toast.error('Erreur de paiement', {
        description: errorMessage
      });
      throw error;
    }
  }

  static async addBill(billData: Omit<Bill, 'id' | 'status' | 'user_id' | 'created_at'>): Promise<Bill> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        const supabase = BillService.getSupabase()!;
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { data, error } = await supabase
          .from('bills')
          .insert({
            ...billData,
            status: 'pending',
            user_id: user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Erreur lors de l\'ajout de la facture');

        toast.success('Facture ajoutée avec succès', {
          description: `La facture ${billData.description} a été ajoutée`
        });

        return data;
      } else {
        // Mock response
        const id = `bill-${Date.now()}`;
        const now = new Date().toISOString();
        
        const newBill: Bill = {
          ...billData,
          id,
          status: 'pending',
          user_id: 'user-1',
          created_at: now
        };
        
        toast.success('Facture ajoutée avec succès', {
          description: `La facture ${billData.description} a été ajoutée`
        });
        
        return newBill;
      }
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Impossible d\'ajouter la facture');
      throw new Error('Impossible d\'ajouter la facture');
    }
  }
}
