
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TransferData } from '@/types/transaction';
import { Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const INSTANT_TRANSFER_FEE = 16; // Frais de 16 DH pour virements instantanés

  const handleSubmit = () => {
    if (!sourceAccount || !recipient || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error('Informations manquantes', {
        description: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }
    
    // Ouvrir la boîte de dialogue de confirmation au lieu d'envoyer immédiatement
    setShowConfirmDialog(true);
  };
  
  const confirmTransfer = () => {
    const amount = parseFloat(transferAmount);
    
    const transferData: TransferData = {
      fromAccountId: parseInt(sourceAccount),
      beneficiaryId: recipient,
      amount: amount,
      motif: description || 'Virement instantané',
      isInstant: true,
      fees: INSTANT_TRANSFER_FEE // Ajout des frais
    };

    onSubmit(transferData);
    setShowConfirmDialog(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-yellow-50 p-4 mb-4 flex items-center">
        <Zap className="h-5 w-5 text-yellow-600 mr-2" />
        <p className="text-sm text-yellow-800">
          Les virements instantanés sont traités immédiatement, 24h/24 et 7j/7, avec des frais supplémentaires de {INSTANT_TRANSFER_FEE} MAD.
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
      
      {/* Dialogue de confirmation avec affichage des frais */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer le virement instantané</DialogTitle>
            <DialogDescription>
              Veuillez vérifier les détails du virement avant de confirmer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="rounded-xl bg-bank-gray-light p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-bank-gray">De :</span>
                  <span className="font-medium">{getSelectedAccount()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bank-gray">À :</span>
                  <span className="font-medium">{getSelectedBeneficiary()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bank-gray">RIB :</span>  {/* Changed from IBAN to RIB */}
                  <span className="font-medium">{getSelectedBeneficiary()?.rib}</span>  {/* Changed from iban to rib */}
                </div>
                <div className="flex justify-between">
                  <span className="text-bank-gray">Montant :</span>
                  <span className="font-medium">{parseFloat(transferAmount).toLocaleString('fr-MA')} MAD</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Frais de virement instantané :</span>
                  <span className="font-medium">{INSTANT_TRANSFER_FEE.toLocaleString('fr-MA')} MAD</span>
                </div>
                <div className="pt-2 border-t border-bank-gray flex justify-between font-semibold">
                  <span>Total débité :</span>
                  <span>{(parseFloat(transferAmount) + INSTANT_TRANSFER_FEE).toLocaleString('fr-MA')} MAD</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="text-amber-500 mr-2 h-5 w-5" />
              <p className="text-sm text-amber-700">
                Les virements instantanés sont définitifs et ne peuvent pas être annulés.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={confirmTransfer}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isLoading}
            >
              <Zap className="mr-2 h-4 w-4" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstantTransferForm;
