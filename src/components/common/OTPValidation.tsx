
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OTPValidationProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (code: string) => Promise<boolean>;
  title?: string;
  description?: string;
}

const OTPValidation: React.FC<OTPValidationProps> = ({ 
  isOpen, 
  onClose, 
  onValidate, 
  title = "Validation par SMS",
  description = "Veuillez saisir le code à 6 chiffres envoyé par SMS sur votre téléphone"
}) => {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const success = await onValidate(code);
      if (success) {
        toast.success("Code validé avec succès");
        onClose();
      } else {
        setError("Code invalide, veuillez réessayer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OTPValidation;
