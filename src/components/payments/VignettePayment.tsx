
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Car, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTransfer } from '@/hooks/useTransfer';
import OTPValidationDialog from '@/components/transfers/OTPValidationDialog';

interface VignettePaymentProps {
  accounts: any[];
}

const VignettePayment: React.FC<VignettePaymentProps> = ({ accounts }) => {
  const [matriculation, setMatriculation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vignetteType, setVignetteType] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    isSmsDialogOpen, 
    requestValidation, 
    validateSms, 
    closeSmsDialog 
  } = useTransfer();

  const vehicleTypes = [
    { id: 'car', name: 'Voiture de tourisme' },
    { id: 'truck', name: 'Camion' },
    { id: 'motorcycle', name: 'Moto' },
  ];

  const vignetteTypes = [
    { id: 'annual', name: 'Annuelle', basePrices: { car: 800, truck: 1200, motorcycle: 400 } },
    { id: 'semiannual', name: 'Semestrielle', basePrices: { car: 450, truck: 700, motorcycle: 250 } },
    { id: 'quarterly', name: 'Trimestrielle', basePrices: { car: 250, truck: 400, motorcycle: 150 } },
  ];

  const handleMatriculationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format matriculation (remove spaces, capitalize)
    const formattedValue = e.target.value.toUpperCase().replace(/\s/g, '');
    setMatriculation(formattedValue);
  };

  const handleVehicleTypeChange = (value: string) => {
    setVehicleType(value);
    // Update amount if vignette type is also selected
    if (vignetteType) {
      const selectedVignette = vignetteTypes.find(v => v.id === vignetteType);
      if (selectedVignette) {
        const price = selectedVignette.basePrices[value as keyof typeof selectedVignette.basePrices];
        setAmount(price.toString());
      }
    }
  };

  const handleVignetteTypeChange = (value: string) => {
    setVignetteType(value);
    // Update amount if vehicle type is also selected
    if (vehicleType) {
      const selectedVignette = vignetteTypes.find(v => v.id === value);
      if (selectedVignette) {
        const price = selectedVignette.basePrices[vehicleType as keyof typeof selectedVignette.basePrices];
        setAmount(price.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matriculation || !vehicleType || !vignetteType || !sourceAccount) {
      toast.error('Formulaire incomplet', {
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Préparer les données pour la vignette
      const transferData = {
        fromAccountId: parseInt(sourceAccount),
        amount: parseFloat(amount),
        motif: `Paiement vignette - ${matriculation}`,
        description: `Vignette ${vehicleType} - ${vignetteTypes.find(v => v.id === vignetteType)?.name}`
      };
      
      // Demander la validation par SMS
      await requestValidation(transferData);
    } catch (error) {
      toast.error('Erreur de paiement', {
        description: 'Impossible de traiter votre demande',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-bank-primary" />
            <div>
              <CardTitle>Paiement de vignette</CardTitle>
              <CardDescription>Réglez votre vignette automobile en ligne</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matriculation">Immatriculation du véhicule</Label>
                <Input
                  id="matriculation"
                  className="bank-input"
                  placeholder="Ex: 123456A"
                  value={matriculation}
                  onChange={handleMatriculationChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Type de véhicule</Label>
                <Select value={vehicleType} onValueChange={handleVehicleTypeChange} required>
                  <SelectTrigger id="vehicle-type" className="bank-input">
                    <SelectValue placeholder="Sélectionnez un type de véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vignette-type">Type de vignette</Label>
                <Select value={vignetteType} onValueChange={handleVignetteTypeChange} required>
                  <SelectTrigger id="vignette-type" className="bank-input">
                    <SelectValue placeholder="Sélectionnez un type de vignette" />
                  </SelectTrigger>
                  <SelectContent>
                    {vignetteTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    className="bank-input pl-8"
                    placeholder="0.00"
                    value={amount}
                    readOnly
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                    MAD
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source-account">Compte source</Label>
                <Select value={sourceAccount} onValueChange={setSourceAccount} required>
                  <SelectTrigger id="source-account" className="bank-input">
                    <SelectValue placeholder="Sélectionnez un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - {account.balance.toLocaleString('fr-MA')} MAD
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="bank-button w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Payer la vignette"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <OTPValidationDialog
        isOpen={isSmsDialogOpen}
        onClose={closeSmsDialog}
        onValidate={validateSms}
      />
    </>
  );
};

export default VignettePayment;
