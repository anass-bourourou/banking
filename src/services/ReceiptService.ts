
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';

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
      if (ReceiptService.useSupabase() && ReceiptService.getSupabase()) {
        const { data, error } = await ReceiptService.getSupabase()!
          .from('receipts')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        // Mock data
        return [
          {
            id: '1',
            title: 'Facture Électricité',
            date: '15/10/2023',
            amount: 687.25,
            reference: 'FACT-OCT23-EL',
            status: 'paid',
            type: 'bill',
            merchant: 'ONEE',
          },
          {
            id: '2',
            title: 'Facture Internet',
            date: '05/10/2023',
            amount: 399.00,
            reference: 'FACT-0592856',
            status: 'paid',
            type: 'subscription',
            merchant: 'Maroc Telecom',
          },
          {
            id: '3',
            title: 'Assurance Habitation',
            date: '01/10/2023',
            amount: 350.75,
            reference: 'ASS-HAB-2023',
            status: 'paid',
            type: 'bill',
            merchant: 'Wafa Assurance',
          },
          {
            id: '4',
            title: 'Facture Eau',
            date: '28/09/2023',
            amount: 215.50,
            reference: 'FACT-EAU-0928',
            status: 'paid',
            type: 'bill',
            merchant: 'ONEE',
          },
          {
            id: '5',
            title: 'Cotisation Retraite',
            date: '15/09/2023',
            amount: 650.00,
            reference: 'COTIS-09-2023',
            status: 'paid',
            type: 'tax',
            merchant: 'CNSS',
          },
        ];
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Impossible de récupérer les reçus');
      throw new Error('Impossible de récupérer les reçus');
    }
  }

  static async downloadReceipt(receiptId: string): Promise<string> {
    try {
      if (ReceiptService.useSupabase() && ReceiptService.getSupabase()) {
        // Implementation for real file download from Supabase Storage would go here
        return 'download_url';
      } else {
        // Mock download - in a real app, this would redirect to or return a file URL
        toast.success('Téléchargement du reçu démarré', {
          description: 'Le téléchargement devrait commencer sous peu'
        });
        return 'mock_download_url';
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
}
