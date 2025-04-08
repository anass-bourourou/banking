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
      if (BillReceiptService.useSupabase() && BillReceiptService.getSupabase()) {
        const { data, error } = await BillReceiptService.getSupabase()!
          .from('bill_receipts')
          .select('*')
          .order('paymentDate', { ascending: false });

        if (error) throw error;
        return data || [];
      } else {
        const response = await fetchWithAuth('/bills/receipts');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          return data as BillReceipt[];
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error fetching bill receipts:', error);
      toast.error('Impossible de récupérer les reçus de paiement');
      throw new Error('Impossible de récupérer les reçus de paiement');
    }
  }

  static async downloadBillReceipt(receiptId: string): Promise<void> {
    try {
      if (BillReceiptService.useSupabase() && BillReceiptService.getSupabase()) {
        const { data: receipt, error: getError } = await BillReceiptService.getSupabase()!
          .from('bill_receipts')
          .select('*')
          .eq('id', receiptId)
          .single();

        if (getError) throw getError;
        if (!receipt || !receipt.pdfUrl) {
          throw new Error('Le reçu n\'est pas disponible');
        }

        const { data, error: downloadError } = await BillReceiptService.getSupabase()!
          .storage
          .from('receipts')
          .download(receipt.pdfUrl);

        if (downloadError) throw downloadError;

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reçu_${receipt.billReference.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetchWithAuth(`/bills/receipts/${receiptId}/download`, {
          method: 'GET'
        });
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reçu_${receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Error downloading bill receipt ${receiptId}:`, error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }

  static async downloadReceipt(bill: Bill): Promise<void> {
    try {
      if (BillReceiptService.useSupabase() && BillReceiptService.getSupabase()) {
        const { data: receipt, error: getError } = await BillReceiptService.getSupabase()!
          .from('bill_receipts')
          .select('*')
          .eq('billId', bill.id)
          .single();

        if (getError) throw getError;
        if (!receipt || !receipt.pdfUrl) {
          throw new Error('Le reçu n\'est pas disponible');
        }

        const { data, error: downloadError } = await BillReceiptService.getSupabase()!
          .storage
          .from('receipts')
          .download(receipt.pdfUrl);

        if (downloadError) throw downloadError;

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reçu_${bill.reference.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
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
      }
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
      if (BillReceiptService.useSupabase() && BillReceiptService.getSupabase()) {
        const totalAmount = vignettes.reduce((sum, v) => sum + v.amount, 0);
        const receiptData = {
          id: `receipt-${Date.now()}`,
          billId: `vignette-${Date.now()}`,
          billReference: `VIGN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          billDescription: `Paiement ${vignettes.length} vignette(s) automobile`,
          amount: totalAmount,
          paymentDate: new Date().toISOString(),
          paymentMethod: `Compte ${account.name}`,
          pdfUrl: null
        };

        const { error } = await BillReceiptService.getSupabase()!
          .from('bill_receipts')
          .insert(receiptData);

        if (error) throw error;

        toast.success('Reçu généré', {
          description: `Le reçu pour le paiement des vignettes a été généré avec succès`
        });
      } else {
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
      }
    } catch (error) {
      console.error('Error generating mass vignette receipt:', error);
      toast.error('Impossible de générer le reçu');
      throw new Error('Impossible de générer le reçu');
    }
  }
}
