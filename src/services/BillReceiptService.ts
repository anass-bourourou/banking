
import { Bill } from './BillService';
import { toast } from 'sonner';
import { Account } from './AccountService';

export class BillReceiptService {
  static async downloadReceipt(bill: Bill): Promise<void> {
    try {
      // Simuler un délai de génération du PDF
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Générer le contenu du PDF
      const pdfContent = `
REÇU DE PAIEMENT
----------------------------------------
Date: ${new Date(bill.paymentDate || new Date()).toLocaleDateString('fr-FR')}
Référence: ${bill.reference}
Émetteur: ${bill.type}
Description: ${bill.description}
Montant: ${bill.amount.toLocaleString('fr-MA')} MAD
Status: ${bill.isPaid ? 'Payé' : 'En attente'}
----------------------------------------
Ce document est un reçu officiel de paiement.
Bank of Morocco
      `;
      
      // Créer un blob pour le PDF
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement et déclencher le téléchargement
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `Recu-${bill.type}-${bill.reference}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Nettoyer l'URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('Reçu téléchargé avec succès');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Erreur lors du téléchargement du reçu');
      throw error;
    }
  }
  
  static async generateVignetteReceipt(
    matricule: string, 
    type: string, 
    amount: number, 
    account: Account
  ): Promise<void> {
    try {
      // Simuler un délai de génération du PDF
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Générer le contenu du PDF pour la vignette
      const currentDate = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(currentDate.getFullYear() + 1);
      
      const pdfContent = `
REÇU DE PAIEMENT VIGNETTE
----------------------------------------
Date: ${currentDate.toLocaleDateString('fr-FR')}
Matricule: ${matricule}
Type de véhicule: ${type}
Montant: ${amount.toLocaleString('fr-MA')} MAD
Compte débité: ${account.name} (${account.number})
Valide du: ${currentDate.toLocaleDateString('fr-FR')}
Valide jusqu'au: ${nextYear.toLocaleDateString('fr-FR')}
Référence: VIG-${Date.now().toString().substring(6)}
----------------------------------------
Ce document tient lieu de justificatif de paiement de la vignette.
À conserver avec les documents du véhicule.
      `;
      
      // Créer un blob pour le PDF
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement et déclencher le téléchargement
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `Vignette-${matricule}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Nettoyer l'URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('Reçu de vignette téléchargé avec succès');
    } catch (error) {
      console.error('Error generating vignette receipt:', error);
      toast.error('Erreur lors de la génération du reçu de vignette');
      throw error;
    }
  }
  
  static async generateMassVignetteReceipt(
    vignettes: { matricule: string; type: string; amount: number }[],
    account: Account
  ): Promise<void> {
    try {
      // Simuler un délai de génération du PDF
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Calculer le montant total
      const totalAmount = vignettes.reduce((sum, vignette) => sum + vignette.amount, 0);
      
      // Générer le contenu du PDF pour les vignettes multiples
      const currentDate = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(currentDate.getFullYear() + 1);
      
      let vignettesList = '';
      vignettes.forEach((vignette, index) => {
        vignettesList += `
${index + 1}. Matricule: ${vignette.matricule}
   Type de véhicule: ${vignette.type}
   Montant: ${vignette.amount.toLocaleString('fr-MA')} MAD
        `;
      });
      
      const pdfContent = `
REÇU DE PAIEMENT VIGNETTES MULTIPLES
----------------------------------------
Date: ${currentDate.toLocaleDateString('fr-FR')}
Nombre de vignettes: ${vignettes.length}
Montant total: ${totalAmount.toLocaleString('fr-MA')} MAD
Compte débité: ${account.name} (${account.number})
Valide du: ${currentDate.toLocaleDateString('fr-FR')}
Valide jusqu'au: ${nextYear.toLocaleDateString('fr-FR')}
Référence: VIGM-${Date.now().toString().substring(6)}

DÉTAIL DES VIGNETTES:
${vignettesList}
----------------------------------------
Ce document tient lieu de justificatif de paiement des vignettes.
À conserver avec les documents des véhicules.
      `;
      
      // Créer un blob pour le PDF
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement et déclencher le téléchargement
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `Vignettes-Multiples-${Date.now()}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Nettoyer l'URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('Reçu des vignettes multiples téléchargé avec succès');
    } catch (error) {
      console.error('Error generating mass vignette receipt:', error);
      toast.error('Erreur lors de la génération du reçu des vignettes multiples');
      throw error;
    }
  }
}
