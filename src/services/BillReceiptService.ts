
import { BaseService } from './BaseService';
import { Bill } from './BillService';
import { toast } from 'sonner';

export class BillReceiptService extends BaseService {
  /**
   * Downloads a receipt for a paid bill
   */
  static async downloadReceipt(bill: Bill): Promise<string> {
    try {
      if (BillReceiptService.useSupabase() && BillReceiptService.getSupabase()) {
        // Implementation for real receipt download from Supabase Storage would go here
        // This would retrieve the PDF from storage or generate it on the fly
        // For now, we'll use our mock implementation
        return await this.generateMockPdf(bill);
      } else {
        return await this.generateMockPdf(bill);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Impossible de télécharger le reçu');
      throw new Error('Impossible de télécharger le reçu');
    }
  }
  
  /**
   * Generates a mock PDF receipt for a bill
   */
  private static async generateMockPdf(bill: Bill): Promise<string> {
    try {
      // This simulates generating a PDF
      return new Promise((resolve) => {
        setTimeout(() => {
          // Create the PDF content
          const pdfContent = this.createPdfContent(bill);
          
          // Create a Blob representing the PDF file
          const blob = new Blob([pdfContent], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          // Create a download link and trigger the download
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = `Reçu-${bill.reference}.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // Clean up the URL object
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          
          toast.success('Téléchargement du reçu démarré', {
            description: 'Le téléchargement devrait commencer sous peu'
          });
          
          resolve(url);
        }, 500);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
  
  /**
   * Creates the content for the PDF receipt
   */
  private static createPdfContent(bill: Bill): string {
    // Format the date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    // In a real implementation, we would use a PDF generation library
    // For this mock, we'll just return a string that would represent PDF content
    return `REÇU DE PAIEMENT
----------------------------------------
N° de Référence: ${bill.reference}
Description: ${bill.description}
Type: ${bill.type}
Montant: ${bill.amount.toLocaleString('fr-MA')} MAD
Date de paiement: ${bill.paymentDate ? formatDate(bill.paymentDate) : 'N/A'}
Date d'échéance: ${formatDate(bill.dueDate)}
Statut: Payé
----------------------------------------
Ce document est un reçu officiel de paiement.
Conservez-le pour vos archives.
`;
  }
}
