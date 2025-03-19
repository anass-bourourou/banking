
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface Bill {
  id: string;
  reference: string;
  type: 'DGI' | 'CIM' | 'OTHER';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  description: string;
}

export class BillService extends BaseService {
  static async getMoroccanBills(): Promise<Bill[]> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        const { data, error } = await BillService.getSupabase()!
          .from('bills')
          .select('*')
          .in('type', ['DGI', 'CIM'])
          .order('dueDate', { ascending: false });

        if (error) throw error;
        return data as Bill[] || [];
      } else {
        // Utiliser des données fictives pour la démonstration
        return [
          {
            id: 'dgi-001',
            reference: 'DGI-2023-7845612',
            type: 'DGI',
            amount: 1250.00,
            dueDate: '2023-12-15',
            status: 'pending',
            description: 'Impôt sur le revenu - 4ème trimestre 2023'
          },
          {
            id: 'dgi-002',
            reference: 'DGI-2023-7845789',
            type: 'DGI',
            amount: 4500.00,
            dueDate: '2023-11-30',
            status: 'pending',
            description: 'TVA - 3ème trimestre 2023'
          },
          {
            id: 'cim-001',
            reference: 'CIM-2023-985412',
            type: 'CIM',
            amount: 560.75,
            dueDate: '2023-12-10',
            status: 'pending',
            description: 'Facture Eau et Assainissement - Novembre 2023'
          },
          {
            id: 'cim-002',
            reference: 'CIM-2023-986523',
            type: 'CIM',
            amount: 425.30,
            dueDate: '2023-11-25',
            status: 'pending',
            description: 'Facture Eau et Assainissement - Octobre 2023'
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching Moroccan bills:', error);
      toast.error('Impossible de récupérer les factures');
      return [];
    }
  }

  static async payBill(billId: string, accountId: number): Promise<boolean> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        // Obtenir les détails de la facture
        const { data: bill, error: billError } = await BillService.getSupabase()!
          .from('bills')
          .select('*')
          .eq('id', billId)
          .single();

        if (billError) throw billError;
        if (!bill) throw new Error('Facture non trouvée');

        // Obtenir les détails du compte
        const { data: account, error: accountError } = await BillService.getSupabase()!
          .from('accounts')
          .select('*')
          .eq('id', accountId)
          .single();

        if (accountError) throw accountError;
        if (!account) throw new Error('Compte non trouvé');

        // Vérifier si le solde est suffisant
        if (account.balance < bill.amount) {
          throw new Error('Solde insuffisant pour payer cette facture');
        }

        // Mise à jour du solde du compte
        const { error: updateError } = await BillService.getSupabase()!
          .from('accounts')
          .update({ 
            balance: account.balance - bill.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId);

        if (updateError) throw updateError;

        // Mise à jour du statut de la facture
        const paymentDate = new Date().toISOString();
        const { error: billUpdateError } = await BillService.getSupabase()!
          .from('bills')
          .update({ 
            status: 'paid',
            paymentDate: paymentDate
          })
          .eq('id', billId);

        if (billUpdateError) throw billUpdateError;

        // Enregistrer la transaction
        const { error: transactionError } = await BillService.getSupabase()!
          .from('transactions')
          .insert({
            description: `Paiement ${bill.type} - ${bill.reference}`,
            amount: bill.amount,
            type: 'debit',
            date: new Date().toLocaleDateString('fr-FR'),
            account_id: accountId,
            category: 'Factures',
            created_at: new Date().toISOString()
          });

        if (transactionError) throw transactionError;

        return true;
      } else {
        // Simulation de paiement pour la démo
        console.log(`Simulation de paiement de la facture ${billId} depuis le compte ${accountId}`);
        return true;
      }
    } catch (error) {
      console.error('Error paying bill:', error);
      toast.error('Impossible de payer la facture');
      throw error;
    }
  }
}
