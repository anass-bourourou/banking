
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TransferData } from '@/services/TransactionService';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

interface InstantTransferFormProps {
  accounts: any[];
  beneficiaries: any[];
  onSubmit: (data: TransferData) => void;
  isLoading: boolean;
}

const InstantTransferForm: React.FC<InstantTransferFormProps> = ({
  accounts,
  beneficiaries,
  onSubmit,
  isLoading
}) => {
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!sourceAccount || !recipient || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error('Informations manquantes', {
        description: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }

    const transferData: TransferData = {
      fromAccount: parseInt(sourceAccount),
      toAccount: recipient,
      amount: parseFloat(transferAmount),
      description: description || 'Virement instantané',
      isInstant: true
    };

    onSubmit(transferData);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*[.,]?\d*$/.test(value)) {
      setTransferAmount(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-yellow-50 p-4 mb-4 flex items-center">
        <Zap className="h-5 w-5 text-yellow-600 mr-2" />
        <p className="text-sm text-yellow-800">
          Les virements instantanés sont traités immédiatement, 24h/24 et 7j/7, avec des frais supplémentaires.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instant-source">Compte source</Label>
          <Select value={sourceAccount} onValueChange={setSourceAccount}>
            <SelectTrigger id="instant-source" className="bank-input">
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
        
        <div className="space-y-2">
          <Label htmlFor="instant-recipient">Bénéficiaire</Label>
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger id="instant-recipient" className="bank-input">
              <SelectValue placeholder="Sélectionnez un bénéficiaire" />
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
          <Label htmlFor="instant-amount">Montant</Label>
          <div className="relative">
            <Input
              id="instant-amount"
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
          <Label htmlFor="instant-description">Motif (optionnel)</Label>
          <Textarea
            id="instant-description"
            className="bank-input"
            placeholder="Ex: Remboursement urgent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center"
        disabled={isLoading}
      >
        <Zap className="mr-2 h-4 w-4" />
        {isLoading ? 'Traitement en cours...' : 'Effectuer le virement instantané'}
      </Button>
    </div>
  );
};

export default InstantTransferForm;
