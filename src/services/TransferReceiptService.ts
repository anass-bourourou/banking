
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export interface TransferReceipt {
  id: string;
  transactionId: number;
  amount: number;
  recipientName: string;
  recipientAccount: string;
  date: string;
  reference: string;
  status: string;
  fromAccount: string;
  description?: string;
  fees?: number;
  pdfUrl?: string;
}

export class TransferReceiptService extends BaseService {
  static async getTransferReceipts(): Promise<TransferReceipt[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/transfers/receipts');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as TransferReceipt[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching transfer receipts:', error);
      toast.error('Impossible de récupérer les reçus de virement');
      throw new Error('Impossible de récupérer les reçus de virement');
    }
  }

  static async downloadTransferReceipt(receiptId: string): Promise<void> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/transfers/receipts/${receiptId}/download`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reçu_virement_${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(`Error downloading transfer receipt ${receiptId}:`, error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
}
