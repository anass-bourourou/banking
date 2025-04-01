
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

  if (!receipt) return null;
  
  const handleDownloadPdf = () => {
    setIsDownloading(true);
    
    // Simulate PDF download
    setTimeout(() => {
      try {
        // Create PDF content
        const pdfContent = `REÇU DE VIREMENT
----------------------------------------
Date: ${new Date(receipt.date).toLocaleDateString('fr-FR')}
Référence: ${receipt.reference_id || 'N/A'}
Montant: ${receipt.amount.toLocaleString('fr-MA')} MAD
Frais: ${receipt.fees ? receipt.fees.toLocaleString('fr-MA') : '0'} MAD
Bénéficiaire: ${receipt.recipient_name || 'Non spécifié'}
Type: ${
  receipt.transfer_type === 'standard' ? 'Virement standard' :
  receipt.transfer_type === 'instantané' ? 'Virement instantané' :
  receipt.transfer_type === 'multiple' ? 'Virement multiple' :
  receipt.transfer_type === 'planifié' ? 'Virement planifié' : 'Virement'
}
${receipt.motif ? `Motif: ${receipt.motif}` : ''}
----------------------------------------
Ce document est un reçu officiel de virement.
Conservez-le pour vos archives.
`;
        
        // Create a Blob representing the PDF file
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create a download link and trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `Recu-Virement-${receipt.reference_id || 'transfer'}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL object
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        toast.success('Téléchargement du reçu démarré', {
          description: 'Le téléchargement devrait commencer sous peu'
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Impossible de générer le PDF');
      } finally {
        setIsDownloading(false);
      }
    }, 500);
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
                <span>{new Date(receipt.date).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Référence:</span>
                <span>{receipt.reference_id || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Montant:</span>
                <span className="font-medium">{receipt.amount.toLocaleString('fr-MA')} MAD</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Frais:</span>
                <span>{receipt.fees ? receipt.fees.toLocaleString('fr-MA') : '0'} MAD</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Bénéficiaire:</span>
                <span>{receipt.recipient_name || 'Non spécifié'}</span>
              </div>
              
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
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Télécharger PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferReceiptDialog;
