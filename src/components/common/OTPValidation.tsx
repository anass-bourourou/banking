
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
  visualKeyboard?: boolean;
}

const OTPValidation: React.FC<OTPValidationProps> = ({ 
  isOpen, 
  onClose, 
  onValidate, 
  title = "Validation par SMS",
  description = "Veuillez saisir le code à 6 chiffres envoyé par SMS sur votre téléphone",
  visualKeyboard = true
}) => {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour réinitialiser l'état à la fermeture
  useEffect(() => {
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

  // Fonction pour gérer les clics sur le clavier visuel
  const handleKeyPress = (digit: string) => {
    if (code.length < 6) {
      setCode(prevCode => prevCode + digit);
    }
  };

  // Fonction pour supprimer le dernier chiffre
  const handleBackspace = () => {
    setCode(prevCode => prevCode.slice(0, -1));
  };

  // Fonction pour effacer tout le code
  const handleClear = () => {
    setCode("");
  };

  // Générer les touches du clavier visuel
  const renderKeyboard = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
    
    return (
      <div className="mt-6 grid grid-cols-3 gap-3">
        {digits.map((digit, index) => (
          <Button
            key={index}
            type="button"
            variant={digit === 'C' || digit === '⌫' ? 'outline' : 'secondary'}
            className={`h-14 text-lg font-medium ${digit === 'C' ? 'text-red-500' : ''}`}
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

  if (!isOpen) return null;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col items-center justify-center">
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
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
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
    </div>
  );
};

export default OTPValidation;
