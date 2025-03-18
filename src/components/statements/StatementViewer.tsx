
import React from 'react';
import { X } from 'lucide-react';
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
import { BankStatement } from '@/services/StatementService';

interface StatementViewerProps {
  statement: BankStatement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (statement: BankStatement) => void;
}

const StatementViewer: React.FC<StatementViewerProps> = ({
  statement,
  open,
  onOpenChange,
  onDownload
}) => {
  if (!statement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="text-bank-primary">Relevé de compte</span>
          </DialogTitle>
          <DialogDescription>
            Détails du relevé bancaire pour la période {statement.period}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-bold text-bank-primary mb-4">
              {statement.accountName}
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-bank-gray">Période:</span>
                <span className="font-medium">{statement.period}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Date d'émission:</span>
                <span className="font-medium">{statement.date}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-bank-gray">Référence:</span>
                <span className="font-medium">{statement.id}</span>
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
            onClick={() => onDownload(statement)}
            className="bg-bank-primary hover:bg-bank-primary-dark"
          >
            Télécharger le PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatementViewer;
