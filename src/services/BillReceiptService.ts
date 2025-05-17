
import { BaseService } from './BaseService';
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
  // Static receipts data
  private static receipts: BillReceipt[] = [
    {
      id: "1",
      billId: "5",
      billReference: "DGI-2025-003",
      billDescription: "Taxe municipale 2025",
      amount: 950.00,
      paymentDate: "2025-05-15",
      paymentMethod: "Carte bancaire",
      pdfUrl: "/receipts/dgi-2025-003.pdf"
    },
    {
      id: "2",
      billId: "6",
      billReference: "CIM-2025-035",
      billDescription: "Facture d'électricité - Avril 2025",
      amount: 325.60,
      paymentDate: "2025-05-08",
      paymentMethod: "Compte courant",
      pdfUrl: "/receipts/cim-2025-035.pdf"
    }
  ];

  static async getBillReceipts(): Promise<BillReceipt[]> {
    try {
      // Return static receipts
      return [...this.receipts];
    } catch (error) {
      console.error('Error fetching bill receipts:', error);
      toast.error('Impossible de récupérer les reçus de paiement');
      throw new Error('Impossible de récupérer les reçus de paiement');
    }
  }

  static async downloadBillReceipt(receiptId: string): Promise<void> {
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Reçu téléchargé', {
        description: `Le reçu #${receiptId} a été téléchargé`
      });
    } catch (error) {
      console.error(`Error downloading bill receipt ${receiptId}:`, error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }

  static async downloadReceipt(bill: Bill): Promise<void> {
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Reçu téléchargé', {
        description: `Le reçu pour ${bill.reference} a été téléchargé`
      });
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
      // Simulate receipt generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
