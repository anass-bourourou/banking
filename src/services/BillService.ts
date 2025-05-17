
import { BaseService } from './BaseService';
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
  user_id?: string;
}

export class BillService extends BaseService {
  static async getMoroccanBills(): Promise<Bill[]> {
    try {
      // Static bills data
      const staticBills: Bill[] = [
        {
          id: '1',
          reference: 'DGI-2025-001',
          type: 'DGI',
          amount: 1250.75,
          dueDate: '2025-06-15',
          status: 'pending',
          description: 'Taxe professionnelle 2025',
        },
        {
          id: '2',
          reference: 'CIM-2025-042',
          type: 'CIM',
          amount: 485.30,
          dueDate: '2025-06-10',
          status: 'pending',
          description: 'Facture d\'eau - Mai 2025',
        },
        {
          id: '3',
          reference: 'DGI-2025-002',
          type: 'DGI',
          amount: 3760.00,
          dueDate: '2025-07-01',
          status: 'pending',
          description: 'TVA - 2ème trimestre 2025',
        },
        {
          id: '4',
          reference: 'OTHER-2025-001',
          type: 'OTHER',
          amount: 525.50,
          dueDate: '2025-05-28',
          status: 'pending',
          description: 'Abonnement Internet - Juin 2025',
        },
        {
          id: '5',
          reference: 'DGI-2025-003',
          type: 'DGI',
          amount: 950.00,
          dueDate: '2025-05-20',
          status: 'paid',
          paymentDate: '2025-05-15',
          description: 'Taxe municipale 2025',
        },
        {
          id: '6',
          reference: 'CIM-2025-035',
          type: 'CIM',
          amount: 325.60,
          dueDate: '2025-05-10',
          status: 'paid',
          paymentDate: '2025-05-08',
          description: 'Facture d\'électricité - Avril 2025',
        }
      ];
      
      return staticBills;
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
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Paiement réussi', {
        description: `Facture payée avec succès`
      });
    } catch (error) {
      console.error('Error paying bill:', error);
      toast.error('Erreur lors du paiement', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
      throw error;
    }
  }
}
