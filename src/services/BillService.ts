
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
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/moroccan-bills');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Bill[];
      }
      
      return [];
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
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/bills/${billId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ accountId, validationCode, validationId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du paiement de la facture');
      }
      
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
