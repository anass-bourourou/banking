
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
      // Use SpringBoot backend API
      const response = await fetchWithAuth('/receipts');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as Receipt[];
      }
      
      // If backend returns no data, use mock data for demonstration purposes
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
  
  // Method to generate a PDF from a receipt
  private static async generatePDF(receipt: Receipt): Promise<Blob> {
    try {
      // This would integrate with the backend PDF generation service
      // For now, create a simple blob
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
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}
