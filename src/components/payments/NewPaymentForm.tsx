
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTransfer } from '@/hooks/useTransfer';

interface NewPaymentFormProps {
  accounts: any[];
  isLoadingAccounts: boolean;
}

const NewPaymentForm: React.FC<NewPaymentFormProps> = ({ accounts, isLoadingAccounts }) => {
  const [paymentType, setPaymentType] = useState('bill');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sourceAccount, setSourceAccount] = useState('');
  
  const { requestValidation } = useTransfer();
  
  const payees = [
    { id: '1', name: 'EDF Électricité' },
    { id: '2', name: 'Orange Télécom' },
    { id: '3', name: 'SAUR Eau' },
    { id: '4', name: 'Assurance Habitation' },
  ];
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payee || !amount || !sourceAccount) {
      toast.error('Formulaire incomplet', {
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }
    
    // Préparer les données pour le paiement
    const transferData = {
      fromAccountId: parseInt(sourceAccount),
      amount: parseFloat(amount),
      motif: `Paiement facture - ${payees.find(p => p.id === payee)?.name}`,
      description: reference ? `Réf: ${reference}` : undefined
    };
    
    // Demander la validation par SMS
    await requestValidation(transferData);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*[.,]?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Effectuer un paiement</CardTitle>
        <CardDescription>Payez vos factures et autres dépenses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">Type de paiement</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger id="payment-type" className="bank-input">
                  <SelectValue placeholder="Sélectionnez un type de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bill">Facture</SelectItem>
                  <SelectItem value="subscription">Abonnement</SelectItem>
                  <SelectItem value="tax">Impôts</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payee">Bénéficiaire</Label>
              <Select value={payee} onValueChange={setPayee}>
                <SelectTrigger id="payee" className="bank-input">
                  <SelectValue placeholder="Sélectionnez un bénéficiaire" />
                </SelectTrigger>
                <SelectContent>
                  {payees.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                  onChange={handleAmountChange}
                />
                <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                  MAD
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Référence (optionnel)</Label>
              <Input
                id="reference"
                className="bank-input"
                placeholder="Ex: Numéro de facture"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date de paiement</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="date"
                    type="button"
                    className="bank-input flex w-full items-center justify-between"
                  >
                    {date ? format(date, 'P', { locale: fr }) : 'Sélectionner une date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Compte source</Label>
              <Select value={sourceAccount} onValueChange={setSourceAccount}>
                <SelectTrigger id="source" className="bank-input">
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
          
          <button type="submit" className="bank-button w-full">
            Effectuer le paiement
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewPaymentForm;
