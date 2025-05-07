
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Transaction, TransferData } from '@/types/transaction';
import { ENDPOINTS } from '@/config/api.config';

export type { TransferData } from '@/types/transaction';

export class TransferService extends BaseService {
  static async createTransfer(transferData: TransferData): Promise<Transaction> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(ENDPOINTS.TRANSFERS.CREATE, {
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
      // Use SpringBoot backend API
      const response = await fetchWithAuth(ENDPOINTS.TRANSFERS.MASS, {
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
    } catch (error) {
      console.error('Error creating mass transfer:', error);
      toast.error('Erreur lors des virements multiples');
      throw error;
    }
  }
}
