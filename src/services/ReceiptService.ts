
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { ENDPOINTS } from '@/config/api.config';

export interface Receipt {
  id: string;
  title: string;
  date: string;
  amount: number;
  reference: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'bill' | 'subscription' | 'tax' | 'other';
  merchant: string;
  fileUrl?: string;
}

export class ReceiptService extends BaseService {
  static async getReceipts(): Promise<Receipt[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/receipts');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des reçus');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Receipt[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Impossible de récupérer les reçus');
      throw new Error('Impossible de récupérer les reçus');
    }
  }

  static async downloadReceipt(receiptId: string): Promise<string> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/receipts/${receiptId}/download`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reçu-${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      toast.success('Téléchargement du reçu démarré', {
        description: 'Le téléchargement devrait commencer sous peu'
      });
      
      return url;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
}
