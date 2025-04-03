
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { CreditCard, Calendar as CalendarIcon, Receipt, FileText, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import VignettePayment from '@/components/payments/VignettePayment';
import EDocuments from '@/components/payments/EDocuments';
import OTPValidationDialog from '@/components/transfers/OTPValidationDialog'; 
import { useTransfer } from '@/hooks/useTransfer';

const Payments = () => {
  const [paymentType, setPaymentType] = useState('bill');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sourceAccount, setSourceAccount] = useState('');
  
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });
  
  const { 
    isSmsDialogOpen, 
    requestValidation, 
    validateSms, 
    closeSmsDialog 
  } = useTransfer();
  
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
  
  const upcomingPayments = [
    { id: 1, payee: 'EDF Électricité', amount: 87.45, dueDate: '25/10/2023', status: 'À venir' },
    { id: 2, payee: 'Orange Télécom', amount: 39.99, dueDate: '03/11/2023', status: 'À venir' },
    { id: 3, payee: 'Assurance Auto', amount: 65.30, dueDate: '15/11/2023', status: 'À venir' },
  ];
  
  const paymentHistory = [
    { id: 1, payee: 'EDF Électricité', amount: 92.30, date: '25/09/2023', reference: 'FACT-2309-EDF' },
    { id: 2, payee: 'Orange Télécom', amount: 39.99, date: '03/10/2023', reference: 'FACT-2310-ORG' },
    { id: 3, payee: 'SAUR Eau', amount: 43.75, date: '10/10/2023', reference: 'FACT-2310-SAUR' },
    { id: 4, payee: 'Assurance Habitation', amount: 28.50, date: '12/10/2023', reference: 'PRIME-OCT23' },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Paiements</h1>
        <p className="text-bank-gray">Effectuez vos paiements et consultez l'historique</p>
      </div>
      
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Nouveau paiement</TabsTrigger>
          <TabsTrigger value="vignette">Paiement vignette</TabsTrigger>
          <TabsTrigger value="upcoming">Paiements à venir</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="documents">E-Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
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
        </TabsContent>
        
        <TabsContent value="vignette">
          <VignettePayment accounts={accounts} />
        </TabsContent>
        
        <TabsContent value="documents">
          <EDocuments />
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Paiements à venir</CardTitle>
              <CardDescription>Consultez vos prochains paiements programmés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                        <CreditCard className="h-5 w-5 text-bank-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.payee}</p>
                        <p className="text-sm text-bank-gray">Échéance: {payment.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{payment.amount.toLocaleString('fr-MA')} MAD</p>
                      <div className="mt-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
                        {payment.status}
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingPayments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                      <CalendarIcon size={24} className="text-bank-gray" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Aucun paiement à venir</h3>
                    <p className="text-bank-gray">
                      Vous n'avez pas de paiements programmés
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>Consultez vos paiements effectués</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.payee}</p>
                        <div className="flex space-x-2 text-sm text-bank-gray">
                          <span>{payment.date}</span>
                          <span>•</span>
                          <span>{payment.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-red-600">{payment.amount.toLocaleString('fr-MA')} MAD</p>
                      <button className="rounded-full bg-bank-gray-light p-2 text-bank-dark hover:bg-bank-gray">
                        <Receipt size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <OTPValidationDialog
        isOpen={isSmsDialogOpen}
        onClose={closeSmsDialog}
        onValidate={validateSms}
      />
    </AppLayout>
  );
};

export default Payments;
