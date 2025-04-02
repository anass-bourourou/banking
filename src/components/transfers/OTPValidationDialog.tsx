
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
  // Wrapper pour adapter l'interface de OTPValidation
  const handleValidate = async (code: string): Promise<boolean> => {
    try {
      await onValidate(code);
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Validation par SMS</DialogTitle>
          <DialogDescription>
            Un code de validation à 6 chiffres a été envoyé par SMS au numéro de téléphone associé à votre compte.
            Veuillez entrer ce code pour confirmer l'opération.
          </DialogDescription>
        </DialogHeader>
        
        <OTPValidation 
          isOpen={isOpen}
          onClose={onClose}
          onValidate={handleValidate}
          visualKeyboard={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OTPValidationDialog;
