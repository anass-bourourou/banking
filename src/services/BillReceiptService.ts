
import { BaseService } from './BaseService';
import { fetchWithAuth } from './api';
import { toast } from 'sonner';
import { Account } from './AccountService';
import { Bill } from './BillService';

export interface BillReceipt {
  id: string;
  billId: string;
  billReference: string;
  billDescription: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  pdfUrl?: string;
}

export class BillReceiptService extends BaseService {
  static async getBillReceipts(): Promise<BillReceipt[]> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/bills/receipts');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as BillReceipt[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching bill receipts:', error);
      toast.error('Impossible de récupérer les reçus de paiement');
      throw new Error('Impossible de récupérer les reçus de paiement');
    }
  }

  static async downloadBillReceipt(receiptId: string): Promise<void> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/bills/receipts/${receiptId}/download`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reçu_${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error downloading bill receipt ${receiptId}:`, error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }

  static async downloadReceipt(bill: Bill): Promise<void> {
    try {
      // Use SpringBoot backend API
      const response = await fetchWithAuth(`/bills/receipts/bill/${bill.id}/download`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reçu_${bill.reference.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error downloading bill receipt for bill ${bill.id}:`, error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }

  static async generateMassVignetteReceipt(
    vignettes: { matricule: string; type: string; amount: number }[], 
    account: Account
  ): Promise<void> {
    try {
      // Use SpringBoot backend API
      await fetchWithAuth('/bills/receipts/vignette', {
        method: 'POST',
        body: JSON.stringify({
          vignettes,
          accountId: account.id
        })
      });
      
      toast.success('Reçu généré', {
        description: `Le reçu pour le paiement des vignettes a été généré avec succès`
      });
    } catch (error) {
      console.error('Error generating mass vignette receipt:', error);
      toast.error('Impossible de générer le reçu');
      throw new Error('Impossible de générer le reçu');
    }
  }
}
