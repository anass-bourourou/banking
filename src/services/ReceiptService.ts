
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
            fileUrl: '/mock-receipts/electricity-oct-2023.pdf'
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
            fileUrl: '/mock-receipts/internet-oct-2023.pdf'
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
            fileUrl: '/mock-receipts/insurance-oct-2023.pdf'
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
            fileUrl: '/mock-receipts/water-sep-2023.pdf'
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
            fileUrl: '/mock-receipts/retirement-sep-2023.pdf'
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
        // Get the receipt to find its file URL
        const receipts = await this.getReceipts();
        const receipt = receipts.find(r => r.id === receiptId);
        
        if (receipt) {
          // Create a PDF document
          const pdfBlob = await ReceiptService.generatePDF(receipt);
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Create a download link and trigger the download
          const downloadLink = document.createElement('a');
          downloadLink.href = pdfUrl;
          downloadLink.download = `Reçu-${receipt.reference}.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // Clean up the URL object
          window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
          
          toast.success('Téléchargement du reçu démarré', {
            description: 'Le téléchargement devrait commencer sous peu'
          });
          
          return pdfUrl;
        } else {
          toast.success('Téléchargement du reçu démarré', {
            description: 'Le téléchargement devrait commencer sous peu'
          });
          return 'mock_download_url';
        }
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
  
  // Méthode pour générer un PDF à partir d'un reçu
  private static async generatePDF(receipt: Receipt): Promise<Blob> {
    try {
      // Dans une vraie application, on utiliserait une bibliothèque comme jsPDF ou pdfmake
      // Pour ce mockup, on simule un délai et on retourne un blob simple
      return new Promise((resolve) => {
        setTimeout(() => {
          // Création d'un blob représentant un fichier PDF
          const pdfContent = `Reçu - ${receipt.title}
Date: ${receipt.date}
Montant: ${receipt.amount.toLocaleString('fr-MA')} MAD
Référence: ${receipt.reference}
Émetteur: ${receipt.merchant}
Statut: ${receipt.status === 'paid' ? 'Payé' : receipt.status === 'pending' ? 'En attente' : 'En retard'}
Type: ${receipt.type === 'bill' ? 'Facture' : receipt.type === 'subscription' ? 'Abonnement' : receipt.type === 'tax' ? 'Taxe' : 'Autre'}

Ce document est un reçu généré automatiquement.
`;
          const blob = new Blob([pdfContent], { type: 'application/pdf' });
          resolve(blob);
        }, 500);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}
