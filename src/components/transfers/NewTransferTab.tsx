
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TransferData } from '@/services/TransactionService';

interface NewTransferTabProps {
  accounts: any[];
  beneficiaries: any[];
  onRequestValidation: (transferData: TransferData) => Promise<void>;
  isLoading: boolean;
}

const NewTransferTab: React.FC<NewTransferTabProps> = ({
  accounts,
  beneficiaries,
  onRequestValidation,
  isLoading
}) => {
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [motif, setMotif] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [transferStep, setTransferStep] = useState(1);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validation for numbers and decimal point
    if (/^\d*[.,]?\d*$/.test(value)) {
      setTransferAmount(value);
    }
  };

  const getSelectedBeneficiary = () => {
    return beneficiaries.find(b => b.id === recipient);
  };

  const getSelectedAccount = () => {
    return accounts.find(a => a.id.toString() === sourceAccount);
  };

  const handleNextStep = () => {
    if (transferStep === 1) {
      // Validation
      if (!sourceAccount || !recipient || !transferAmount || parseFloat(transferAmount) <= 0) {
        toast.error('Veuillez remplir tous les champs obligatoires', {
          description: 'Le montant doit être supérieur à 0',
        });
        return;
      }
      setTransferStep(2);
    } else if (transferStep === 2) {
      // Préparer les données de transfert
      const selectedAccount = accounts.find(a => a.id.toString() === sourceAccount);
      const selectedBeneficiary = beneficiaries.find(b => b.id === recipient);
      
      if (!selectedAccount || !selectedBeneficiary) {
        toast.error('Données invalides', {
          description: 'Compte source ou bénéficiaire non trouvé',
        });
        return;
      }

      const transferData: TransferData = {
        fromAccountId: selectedAccount.id,
        beneficiaryId: selectedBeneficiary.id,
        amount: parseFloat(transferAmount),
        motif: motif || undefined,
        scheduledDate: transferDate || undefined
      };
      
      // Demander la validation par SMS
      onRequestValidation(transferData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Effectuer un virement</CardTitle>
        <CardDescription>Envoyez de l'argent à vos bénéficiaires</CardDescription>
      </CardHeader>
      <CardContent>
        {transferStep === 1 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Compte source</Label>
                <Select value={sourceAccount} onValueChange={setSourceAccount} disabled={isLoading}>
                  <SelectTrigger id="source" className="bank-input">
                    <SelectValue placeholder={isLoading ? "Chargement..." : "Sélectionnez un compte"} />
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
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Bénéficiaire</Label>
                <Select value={recipient} onValueChange={setRecipient} disabled={isLoading}>
                  <SelectTrigger id="recipient" className="bank-input">
                    <SelectValue placeholder={isLoading ? "Chargement..." : "Sélectionnez un bénéficiaire"} />
                  </SelectTrigger>
                  <SelectContent>
                    {beneficiaries.map((beneficiary) => (
                      <SelectItem key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    className="bank-input pl-12"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={handleAmountChange}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                    MAD
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motif">Motif (optionnel)</Label>
                <Textarea
                  id="motif"
                  className="bank-input"
                  placeholder="Ex: Remboursement restaurant"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transferDate">Date du virement</Label>
                <Input
                  id="transferDate"
                  type="date"
                  className="bank-input"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-bank-gray text-bank-primary focus:ring-bank-primary"
                />
                <Label htmlFor="recurring">Virement récurrent</Label>
              </div>
            </div>

            <Button 
              onClick={handleNextStep} 
              className="bank-button w-full"
              disabled={isLoading}
            >
              Continuer
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl bg-bank-gray-light p-6">
              <h3 className="mb-4 text-lg font-medium">Récapitulatif du virement</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-bank-gray">De :</span>
                  <span className="font-medium">{getSelectedAccount()?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-bank-gray">À :</span>
                  <span className="font-medium">{getSelectedBeneficiary()?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-bank-gray">IBAN :</span>
                  <span className="font-medium">{getSelectedBeneficiary()?.iban}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-bank-gray">Montant :</span>
                  <span className="font-medium text-bank-primary">
                    {parseFloat(transferAmount).toLocaleString('fr-MA')} MAD
                  </span>
                </div>
                
                {motif && (
                  <div className="flex justify-between">
                    <span className="text-bank-gray">Motif :</span>
                    <span className="font-medium">{motif}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-bank-gray">Date :</span>
                  <span className="font-medium">
                    {transferDate ? new Date(transferDate).toLocaleDateString('fr-FR') : 'Immédiat'}
                  </span>
                </div>
                
                {isRecurring && (
                  <div className="flex justify-between">
                    <span className="text-bank-gray">Récurrence :</span>
                    <span className="font-medium">Mensuel</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={() => setTransferStep(1)} 
                className="bank-button-secondary w-full"
                variant="outline"
                disabled={isLoading}
              >
                Modifier
              </Button>
              <Button 
                onClick={handleNextStep} 
                className="bank-button w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Traitement...' : 'Valider le virement'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewTransferTab;
