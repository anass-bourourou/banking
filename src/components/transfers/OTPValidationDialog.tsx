
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import OTPValidation from '@/components/common/OTPValidation';

interface OTPValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (code: string) => Promise<void>;
  isValidating: boolean;
}

const OTPValidationDialog: React.FC<OTPValidationDialogProps> = ({
  isOpen,
  onClose,
  onValidate,
  isValidating
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validation par SMS</DialogTitle>
          <DialogDescription>
            Un code de validation a été envoyé par SMS au numéro de téléphone associé à votre compte.
            Veuillez entrer ce code pour confirmer le virement.
          </DialogDescription>
        </DialogHeader>
        
        <OTPValidation 
          isOpen={isOpen}
          onClose={onClose}
          onValidate={async (code) => {
            await onValidate(code);
            return true;
          }}
          title="Validation du virement"
          description="Veuillez saisir le code à 6 chiffres envoyé par SMS sur votre téléphone pour confirmer le virement"
        />
      </DialogContent>
    </Dialog>
  );
};

export default OTPValidationDialog;
