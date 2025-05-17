
import { BaseService } from './BaseService';
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
  // Static receipts data
  private static receipts: Receipt[] = [
    {
      id: "1",
      title: "Facture d'électricité",
      date: "15/05/2025",
      amount: 325.60,
      reference: "ELEC-2025-0512",
      status: "paid",
      type: "bill",
      merchant: "CIM - Lydec",
      fileUrl: "/receipts/elec-2025-0512.pdf"
    },
    {
      id: "2",
      title: "Taxe municipale",
      date: "12/05/2025",
      amount: 950.00,
      reference: "TAXE-2025-0487",
      status: "paid",
      type: "tax",
      merchant: "DGI",
      fileUrl: "/receipts/taxe-2025-0487.pdf"
    },
    {
      id: "3",
      title: "Abonnement Internet",
      date: "05/05/2025",
      amount: 399.00,
      reference: "INT-2025-1241",
      status: "paid",
      type: "subscription",
      merchant: "Maroc Telecom",
      fileUrl: "/receipts/int-2025-1241.pdf"
    },
    {
      id: "4",
      title: "Vignette Automobile",
      date: "28/04/2025",
      amount: 700.00,
      reference: "VIG-2025-5647",
      status: "paid",
      type: "tax",
      merchant: "DGI - Vignettes",
      fileUrl: "/receipts/vig-2025-5647.pdf"
    }
  ];

  static async getReceipts(): Promise<Receipt[]> {
    try {
      // Return static receipts
      return [...this.receipts];
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Impossible de récupérer les reçus');
      throw new Error('Impossible de récupérer les reçus');
    }
  }

  static async downloadReceipt(receiptId: string): Promise<string> {
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Téléchargement du reçu démarré', {
        description: 'Le téléchargement devrait commencer sous peu'
      });
      
      // Return dummy URL
      return `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRml...`;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
}
