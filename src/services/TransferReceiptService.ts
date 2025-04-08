
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
      if (TransferReceiptService.useSupabase() && TransferReceiptService.getSupabase()) {
        const { data, error } = await TransferReceiptService.getSupabase()!
          .from('transfer_receipts')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Utiliser l'API backend
        const response = await fetchWithAuth('/transfers/receipts');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          return data as TransferReceipt[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching transfer receipts:', error);
      toast.error('Impossible de récupérer les reçus de virement');
      throw new Error('Impossible de récupérer les reçus de virement');
    }
  }

  static async downloadTransferReceipt(receiptId: string): Promise<void> {
    try {
      if (TransferReceiptService.useSupabase() && TransferReceiptService.getSupabase()) {
        const { data: receipt, error: getError } = await TransferReceiptService.getSupabase()!
          .from('transfer_receipts')
          .select('*')
          .eq('id', receiptId)
          .single();

        if (getError) throw getError;
        if (!receipt || !receipt.pdfUrl) {
          throw new Error('Le reçu n\'est pas disponible');
        }

        // Télécharger le fichier
        const { data, error: downloadError } = await TransferReceiptService.getSupabase()!
          .storage
          .from('transfer_receipts')
          .download(receipt.pdfUrl);

        if (downloadError) throw downloadError;

        // Créer un lien pour télécharger le fichier
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reçu_virement_${receipt.reference.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Utiliser l'API backend
        const response = await fetchWithAuth(`/transfers/receipts/${receiptId}/download`, {
          method: 'GET'
        });
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reçu_virement_${receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Error downloading transfer receipt ${receiptId}:`, error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
}
