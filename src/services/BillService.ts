
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
        // Get current user
        const { data: { user }, error: userError } = await BillService.getSupabase()!.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { data, error } = await BillService.getSupabase()!
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
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

        // Vérifier si la facture n'est pas déjà payée
        if (bill.status === 'paid') {
          toast.info('Cette facture a déjà été payée', {
            description: `Paiement effectué le ${new Date(bill.paymentDate).toLocaleDateString('fr-FR')}`
          });
          return true;
        }

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
          toast.error('Solde insuffisant', {
            description: 'Votre compte ne dispose pas de fonds suffisants pour payer cette facture'
          });
          throw new Error('Solde insuffisant pour payer cette facture');
        }

        // Créer une transaction Supabase
        const paymentDate = new Date().toISOString();

        // 1. Mise à jour du solde du compte
        const { error: updateError } = await BillService.getSupabase()!
          .from('accounts')
          .update({ 
            balance: account.balance - bill.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId);

        if (updateError) throw updateError;

        // 2. Mise à jour du statut de la facture
        const { error: billUpdateError } = await BillService.getSupabase()!
          .from('bills')
          .update({ 
            status: 'paid',
            paymentDate: paymentDate
          })
          .eq('id', billId);

        if (billUpdateError) throw billUpdateError;

        // 3. Enregistrer la transaction
        const { data: transaction, error: transactionError } = await BillService.getSupabase()!
          .from('transactions')
          .insert({
            description: `Paiement ${bill.type} - ${bill.reference}`,
            amount: bill.amount,
            type: 'debit',
            date: new Date().toISOString(),
            account_id: accountId,
            category: 'Factures',
            status: 'completed',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // 4. Créer une notification
        await BillService.getSupabase()!
          .from('notifications')
          .insert({
            title: `Paiement ${bill.type} effectué`,
            message: `Votre paiement de ${bill.amount.toLocaleString('fr-MA')} MAD pour la facture ${bill.reference} a été effectué avec succès.`,
            type: 'info',
            date: new Date().toISOString(),
            read: false,
            user_id: account.user_id,
            transaction_id: transaction.id
          });

        toast.success('Paiement effectué avec succès', {
          description: `Votre facture ${bill.reference} a été payée`
        });

        return true;
      } else {
        // Simulation de paiement pour la démo
        console.log(`Simulation de paiement de la facture ${billId} depuis le compte ${accountId}`);
        
        toast.success('Paiement effectué avec succès', {
          description: 'Votre facture a été payée'
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error paying bill:', error);
      toast.error('Impossible de payer la facture', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors du paiement'
      });
      throw error;
    }
  }

  static async getAllUserBills(): Promise<Bill[]> {
    try {
      if (BillService.useSupabase() && BillService.getSupabase()) {
        // Get current user
        const { data: { user }, error: userError } = await BillService.getSupabase()!.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Utilisateur non connecté');

        const { data, error } = await BillService.getSupabase()!
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
          .order('dueDate', { ascending: true });

        if (error) throw error;
        return data as Bill[] || [];
      } else {
        // Utiliser des données fictives pour la démonstration, y compris les factures payées
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
          },
          {
            id: 'dgi-003',
            reference: 'DGI-2023-7845123',
            type: 'DGI',
            amount: 2750.00,
            dueDate: '2023-10-15',
            status: 'paid',
            paymentDate: '2023-10-10',
            description: 'Impôt sur le revenu - 3ème trimestre 2023'
          },
          {
            id: 'cim-003',
            reference: 'CIM-2023-985001',
            type: 'CIM',
            amount: 430.50,
            dueDate: '2023-10-10',
            status: 'paid',
            paymentDate: '2023-10-05',
            description: 'Facture Eau et Assainissement - Septembre 2023'
          },
        ];
      }
    } catch (error) {
      console.error('Error fetching all user bills:', error);
      toast.error('Impossible de récupérer les factures');
      return [];
    }
  }
}
