import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, CreditCard, Send, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Transfers = () => {
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [description, setDescription] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [transferStep, setTransferStep] = useState(1);

  const beneficiaries = [
    { id: '1', name: 'Marie Durand', account: 'FR76 3000 4000 1200 0000 9876 543' },
    { id: '2', name: 'Pierre Martin', account: 'FR76 1234 5678 9101 1121 3141 516' },
    { id: '3', name: 'Sophie Leroy', account: 'FR76 9876 5432 1098 7654 3210 123' },
  ];

  const accounts = [
    { id: '1', name: 'Compte Courant', balance: 4850.75 },
    { id: '2', name: 'Compte Épargne', balance: 12350.20 },
  ];

  const handleNextStep = () => {
    if (transferStep === 1) {
      // Validation de la première étape
      if (!sourceAccount || !recipient || !transferAmount || parseFloat(transferAmount) <= 0) {
        toast.error('Veuillez remplir tous les champs obligatoires', {
          description: 'Le montant doit être supérieur à 0',
        });
        return;
      }
      setTransferStep(2);
    } else if (transferStep === 2) {
      // Simulation de l'envoi du virement
      toast.success('Virement effectué avec succès', {
        description: `Virement de ${parseFloat(transferAmount).toLocaleString('fr-FR')}€ envoyé`,
      });
      // Réinitialiser le formulaire
      setTransferAmount('');
      setRecipient('');
      setSourceAccount('');
      setDescription('');
      setTransferDate('');
      setIsRecurring(false);
      setTransferStep(1);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validation simple pour n'accepter que des chiffres et un point/virgule
    if (/^\d*[.,]?\d*$/.test(value)) {
      setTransferAmount(value);
    }
  };

  const getSelectedBeneficiary = () => {
    return beneficiaries.find(b => b.id === recipient);
  };

  const getSelectedAccount = () => {
    return accounts.find(a => a.id === sourceAccount);
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Virements</h1>
        <p className="text-bank-gray">Effectuez des virements rapidement et en toute sécurité</p>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Nouveau virement</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="recurring">Virements programmés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
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
                      <Select value={sourceAccount} onValueChange={setSourceAccount}>
                        <SelectTrigger id="source" className="bank-input">
                          <SelectValue placeholder="Sélectionnez un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} - {account.balance.toLocaleString('fr-FR')}€
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Bénéficiaire</Label>
                      <Select value={recipient} onValueChange={setRecipient}>
                        <SelectTrigger id="recipient" className="bank-input">
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
                          className="bank-input pl-8"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={handleAmountChange}
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                          €
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optionnel)</Label>
                      <Input
                        id="description"
                        className="bank-input"
                        placeholder="Ex: Remboursement restaurant"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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

                  <button onClick={handleNextStep} className="bank-button w-full">
                    Continuer
                  </button>
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
                        <span className="font-medium">{getSelectedBeneficiary()?.account}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-bank-gray">Montant :</span>
                        <span className="font-medium text-bank-primary">
                          {parseFloat(transferAmount).toLocaleString('fr-FR')}€
                        </span>
                      </div>
                      
                      {description && (
                        <div className="flex justify-between">
                          <span className="text-bank-gray">Description :</span>
                          <span className="font-medium">{description}</span>
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
                    <button 
                      onClick={() => setTransferStep(1)} 
                      className="bank-button-secondary w-full"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={handleNextStep} 
                      className="bank-button w-full"
                    >
                      Confirmer le virement
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des virements</CardTitle>
              <CardDescription>Consultez vos virements précédents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                        <Send className="h-5 w-5 text-bank-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {idx === 1 ? 'Marie Durand' : idx === 2 ? 'Pierre Martin' : 'Sophie Leroy'}
                        </p>
                        <p className="text-sm text-bank-gray">
                          {idx === 1 ? '15/09/2023' : idx === 2 ? '05/09/2023' : '28/08/2023'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        -{idx === 1 ? '150,00' : idx === 2 ? '75,00' : '200,00'} €
                      </p>
                      <p className="text-sm text-bank-gray">
                        {idx === 1 ? 'Remboursement dîner' : idx === 2 ? 'Cadeau anniversaire' : 'Part loyer'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <CardTitle>Virements programmés</CardTitle>
              <CardDescription>Gérez vos virements récurrents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Virement mensuel loyer</p>
                      <div className="flex space-x-2 text-sm text-bank-gray">
                        <span>Sophie Leroy</span>
                        <span>•</span>
                        <span>Tous les 1er du mois</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-950,00 €</p>
                    <div className="mt-1 flex justify-end space-x-2">
                      <button className="rounded-full bg-bank-gray-light px-3 py-1 text-xs font-medium text-bank-dark hover:bg-bank-gray-light/80">
                        Modifier
                      </button>
                      <button className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center py-4">
                  <button className="bank-button-secondary flex items-center space-x-2">
                    <Send size={16} />
                    <span>Créer un nouveau virement programmé</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Transfers;
