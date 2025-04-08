
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TransferData } from '@/types/transaction';
import { Users, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MassTransferFormProps {
  accounts: any[];
  beneficiaries: any[];
  onSubmit: (data: TransferData) => void;
  isLoading: boolean;
}

interface Recipient {
  id: string;
  name: string;
  amount: string;
}

const MassTransferForm: React.FC<MassTransferFormProps> = ({
  accounts,
  beneficiaries,
  onSubmit,
  isLoading
}) => {
  const [sourceAccount, setSourceAccount] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [currentBeneficiary, setCurrentBeneficiary] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  
  const handleAddRecipient = () => {
    if (!currentBeneficiary || !currentAmount || parseFloat(currentAmount) <= 0) {
      toast.error('Informations incomplètes', {
        description: 'Veuillez sélectionner un bénéficiaire et saisir un montant valide.'
      });
      return;
    }
    
    const beneficiary = beneficiaries.find(b => b.id === currentBeneficiary);
    if (!beneficiary) return;
    
    setRecipients([...recipients, {
      id: currentBeneficiary,
      name: beneficiary.name,
      amount: currentAmount
    }]);
    
    setCurrentBeneficiary('');
    setCurrentAmount('');
  };
  
  const handleRemoveRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };
  
  const handleSubmit = () => {
    if (!sourceAccount || recipients.length === 0) {
      toast.error('Informations manquantes', {
        description: 'Veuillez sélectionner un compte source et ajouter au moins un bénéficiaire.'
      });
      return;
    }
    
    const transferData: TransferData = {
      fromAccountId: parseInt(sourceAccount),
      amount: recipients.reduce((sum, recipient) => sum + parseFloat(recipient.amount), 0),
      motif: 'Virement multiple',
      recipients: recipients.map(r => ({
        id: r.id,
        amount: parseFloat(r.amount)
      }))
    };
    
    onSubmit(transferData);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*[.,]?\d*$/.test(value)) {
      setCurrentAmount(value);
    }
  };
  
  const totalAmount = recipients.reduce((sum, recipient) => sum + parseFloat(recipient.amount), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 p-4 mb-4 flex items-center">
        <Users className="h-5 w-5 text-blue-600 mr-2" />
        <p className="text-sm text-blue-800">
          Le virement de masse vous permet d'effectuer plusieurs virements en une seule opération.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mass-source">Compte source</Label>
          <Select value={sourceAccount} onValueChange={setSourceAccount}>
            <SelectTrigger id="mass-source" className="bank-input">
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
        
        <div className="p-4 border border-gray-200 rounded-lg space-y-4">
          <h3 className="font-medium">Ajouter des bénéficiaires</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beneficiary">Bénéficiaire</Label>
              <Select value={currentBeneficiary} onValueChange={setCurrentBeneficiary}>
                <SelectTrigger id="beneficiary" className="bank-input">
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
              <Label htmlFor="amount">Montant</Label>
              <div className="relative">
                <Input
                  id="amount"
                  className="bank-input pl-12"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={handleAmountChange}
                />
                <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                  MAD
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAddRecipient} 
            variant="outline" 
            className="w-full flex items-center justify-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter ce bénéficiaire
          </Button>
        </div>
        
        {recipients.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead className="text-right">Montant (MAD)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((recipient, index) => (
                  <TableRow key={index}>
                    <TableCell>{recipient.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {parseFloat(recipient.amount).toLocaleString('fr-MA')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveRecipient(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {totalAmount.toLocaleString('fr-MA')}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isLoading || recipients.length === 0}
      >
        {isLoading ? 'Traitement en cours...' : `Effectuer ${recipients.length} virements`}
      </Button>
    </div>
  );
};

export default MassTransferForm;
