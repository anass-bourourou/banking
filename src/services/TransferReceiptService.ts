
import { BaseService } from './BaseService';
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
  // Static transfer receipts data
  private static transferReceipts: TransferReceipt[] = [
    {
      id: "1",
      transactionId: 1001,
      amount: 2500.00,
      recipientName: "Mohammed Alaoui",
      recipientAccount: "011810000000123456789012",
      date: "17/05/2025",
      reference: "VIR-2025-1001",
      status: "completed",
      fromAccount: "Compte Courant",
      description: "Remboursement",
      fees: 0,
      pdfUrl: "/receipts/vir-2025-1001.pdf"
    },
    {
      id: "2",
      transactionId: 1002,
      amount: 1000.00,
      recipientName: "Fatima Benali",
      recipientAccount: "011810000000987654321098",
      date: "15/05/2025",
      reference: "VIR-2025-1002",
      status: "completed",
      fromAccount: "Compte Courant",
      description: "Loyer Mai 2025",
      fees: 0,
      pdfUrl: "/receipts/vir-2025-1002.pdf"
    },
    {
      id: "3",
      transactionId: 1003,
      amount: 5000.00,
      recipientName: "Ahmed Tazi",
      recipientAccount: "022810000000567890123456",
      date: "10/05/2025",
      reference: "VIR-2025-1003",
      status: "completed",
      fromAccount: "Compte Épargne",
      description: "Transfert personnel",
      fees: 0,
      pdfUrl: "/receipts/vir-2025-1003.pdf"
    }
  ];

  static async getTransferReceipts(): Promise<TransferReceipt[]> {
    try {
      // Return static transfer receipts
      return [...this.transferReceipts];
    } catch (error) {
      console.error('Error fetching transfer receipts:', error);
      toast.error('Impossible de récupérer les reçus de virement');
      throw new Error('Impossible de récupérer les reçus de virement');
    }
  }

  static async downloadTransferReceipt(receiptId: string): Promise<void> {
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Reçu téléchargé', {
        description: `Le reçu de virement a été téléchargé`
      });
    } catch (error) {
      console.error(`Error downloading transfer receipt ${receiptId}:`, error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
}
