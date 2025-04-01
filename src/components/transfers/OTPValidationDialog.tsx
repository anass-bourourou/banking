
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [visualKeyboard, setVisualKeyboard] = React.useState(true);

  // Reset code and error when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setCode("");
      setError(null);
    }
  }, [isOpen]);

  const handleValidate = async () => {
    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return;
    }

    setError(null);

    try {
      await onValidate(code);
      toast.success("Code validé avec succès");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  // Handle visual keyboard input
  const handleKeyPress = (digit: string) => {
    if (code.length < 6) {
      setCode(prevCode => prevCode + digit);
    }
  };

  const handleBackspace = () => {
    setCode(prevCode => prevCode.slice(0, -1));
  };

  const handleClear = () => {
    setCode("");
  };

  // Generate visual keyboard
  const renderKeyboard = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
    
    return (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {digits.map((digit, index) => (
          <Button
            key={index}
            type="button"
            variant={digit === 'C' || digit === '⌫' ? 'outline' : 'secondary'}
            className={`p-4 text-lg font-medium ${digit === 'C' ? 'text-red-500' : ''}`}
            onClick={() => {
              if (digit === '⌫') handleBackspace();
              else if (digit === 'C') handleClear();
              else handleKeyPress(digit);
            }}
            disabled={isValidating}
          >
            {digit}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Validation par SMS</DialogTitle>
          <DialogDescription>
            Un code de validation a été envoyé par SMS au numéro de téléphone associé à votre compte.
            Veuillez entrer ce code pour confirmer le virement.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <InputOTP 
            maxLength={6} 
            value={code} 
            onChange={setCode}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
          
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}

          {visualKeyboard && renderKeyboard()}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isValidating}>
            Annuler
          </Button>
          <Button onClick={handleValidate} disabled={code.length !== 6 || isValidating}>
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validation...
              </>
            ) : (
              "Valider"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPValidationDialog;
