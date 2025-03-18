
import React from 'react';
import { X, Receipt as ReceiptIcon, CreditCard, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Receipt } from '@/services/ReceiptService';

interface ReceiptViewerProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (receipt: Receipt) => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipt,
  open,
  onOpenChange,
  onDownload
}) => {
  if (!receipt) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bill':
        return <ReceiptIcon className="h-5 w-5" />;
      case 'subscription':
        return <CreditCard className="h-5 w-5" />;
      case 'tax':
        return <Tag className="h-5 w-5" />;
      default:
        return <ReceiptIcon className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bill':
        return 'Facture';
      case 'subscription':
        return 'Abonnement';
      case 'tax':
        return 'Taxe';
      case 'other':
        return 'Autre';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="text-bank-primary">Reçu</span>
          </DialogTitle>
          <DialogDescription>
            Détails du reçu {receipt.reference}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-bank-primary flex items-center gap-2">
                {getTypeIcon(receipt.type)}
                <span>{receipt.title}</span>
              </h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(receipt.status)}`}>
                {getStatusLabel(receipt.status)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-bank-gray">Montant:</span>
                <span className="font-medium">{receipt.amount.toLocaleString('fr-MA')} MAD</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Date:</span>
                <span className="font-medium">{receipt.date}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Référence:</span>
                <span className="font-medium">{receipt.reference}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Émetteur:</span>
                <span className="font-medium">{receipt.merchant}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Type:</span>
                <span className="font-medium">{getTypeLabel(receipt.type)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-bank-gray italic text-sm">
            Les détails complets sont disponibles dans le document PDF téléchargeable.
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
          <Button 
            onClick={() => onDownload(receipt)}
            className="bg-bank-primary hover:bg-bank-primary-dark"
          >
            Télécharger le PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;
