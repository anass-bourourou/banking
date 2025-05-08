
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Check, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AccountService } from '@/services/AccountService';

interface TransferReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: any;
}

const TransferReceiptDialog: React.FC<TransferReceiptDialogProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [accountInfo, setAccountInfo] = React.useState<any>(null);

  React.useEffect(() => {
    if (isOpen && receipt && receipt.sender_account_id) {
      fetchAccountInfo(receipt.sender_account_id);
    }
  }, [isOpen, receipt]);

  const fetchAccountInfo = async (accountId: number) => {
    try {
      const accounts = await AccountService.getAccounts();
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        setAccountInfo(account);
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  if (!receipt) return null;
  
  const handleDownloadPdf = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      try {
        // Créer contenu PDF plus détaillé avec les infos du compte
        const pdfContent = `
REÇU DE VIREMENT - BANK OF MOROCCO
========================================
Date d'opération: ${new Date(receipt.date || receipt.execution_date || receipt.created_at).toLocaleDateString('fr-FR')}
Heure d'opération: ${new Date(receipt.date || receipt.execution_date || receipt.created_at).toLocaleTimeString('fr-FR')}
Référence: ${receipt.reference_id || receipt.reference_number || receipt.id || 'N/A'}

DÉTAILS DU VIREMENT
----------------------------------------
Montant: ${receipt.amount.toLocaleString('fr-MA')} MAD
Frais: ${receipt.fees ? receipt.fees.toLocaleString('fr-MA') : '0'} MAD
Total débité: ${(receipt.amount + (receipt.fees || 0)).toLocaleString('fr-MA')} MAD
Motif: ${receipt.motif || 'Non spécifié'}
Type: ${
  receipt.transfer_type === 'standard' ? 'Virement standard' :
  receipt.transfer_type === 'instantané' ? 'Virement instantané' :
  receipt.transfer_type === 'multiple' ? 'Virement multiple' :
  receipt.transfer_type === 'planifié' ? 'Virement planifié' : 'Virement'
}

INFORMATIONS EXPÉDITEUR
----------------------------------------
${accountInfo ? `Compte: ${accountInfo.name}
Numéro: ${accountInfo.number}
RIB: ${accountInfo.rib || 'Non spécifié'}` : 'Informations non disponibles'}  {/* Changed from IBAN to RIB */}

INFORMATIONS BÉNÉFICIAIRE
----------------------------------------
Nom: ${receipt.recipient_name || (receipt.recipient_details ? receipt.recipient_details.name : 'Non spécifié')}
Compte: ${receipt.recipient_account || (receipt.recipient_details ? receipt.recipient_details.account : 'Non spécifié')}

INFORMATIONS BANCAIRES
----------------------------------------
Banque: Bank of Morocco
Adresse: 123 Avenue Mohammed V, Casablanca
Tel: +212 522 000 000
Email: contact@bankofmorocco.ma
Site web: www.bankofmorocco.ma

========================================
Ce document est un reçu officiel de virement.
Conservez-le pour vos archives.
Date d'édition: ${new Date().toLocaleDateString('fr-FR')}
        `;
        
        // Créer un Blob représentant le fichier PDF
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement et déclencher le téléchargement
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `Recu-Virement-${receipt.reference_id || receipt.reference_number || receipt.id || Date.now()}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Nettoyer l'URL
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        toast.success('Reçu téléchargé avec succès');
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Impossible de générer le PDF');
      } finally {
        setIsDownloading(false);
      }
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reçu de virement</DialogTitle>
          <DialogDescription>
            Détails du virement effectué
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-bank-gray-light p-4">
            <div className="mb-2 text-center">
              <Check className="mx-auto mb-2 h-10 w-10 rounded-full bg-green-100 p-2 text-green-600" />
              <h3 className="text-lg font-medium text-green-600">Virement réussi</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-bank-gray">Date:</span>
                <span>{new Date(receipt.date || receipt.execution_date || receipt.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Référence:</span>
                <span>{receipt.reference_id || receipt.reference_number || receipt.id || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Montant:</span>
                <span className="font-medium">{receipt.amount.toLocaleString('fr-MA')} MAD</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Frais:</span>
                <span>{receipt.fees ? receipt.fees.toLocaleString('fr-MA') : '0'} MAD</span>
              </div>
              
              {accountInfo && (
                <div className="flex justify-between">
                  <span className="text-bank-gray">Compte source:</span>
                  <span>{accountInfo.name}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Bénéficiaire:</span>
                <span>{receipt.recipient_name || (receipt.recipient_details ? receipt.recipient_details.name : 'Non spécifié')}</span>
              </div>
              
              {(receipt.recipient_account || (receipt.recipient_details && receipt.recipient_details.account)) && (
                <div className="flex justify-between">
                  <span className="text-bank-gray">Compte:</span>
                  <span>{receipt.recipient_account || receipt.recipient_details.account}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Type:</span>
                <span>{
                  receipt.transfer_type === 'standard' ? 'Virement standard' :
                  receipt.transfer_type === 'instantané' ? 'Virement instantané' :
                  receipt.transfer_type === 'multiple' ? 'Virement multiple' :
                  receipt.transfer_type === 'planifié' ? 'Virement planifié' : 'Virement'
                }</span>
              </div>
              
              {receipt.motif && (
                <div className="flex justify-between">
                  <span className="text-bank-gray">Motif:</span>
                  <span>{receipt.motif}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="w-full sm:w-auto"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Préparation du PDF...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferReceiptDialog;
