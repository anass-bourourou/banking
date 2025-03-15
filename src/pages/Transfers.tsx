
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, CreditCard, Send, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DataService, Account, Beneficiary, TransferData, Transaction } from '@/services/DataService';
import { Button } from '@/components/ui/button';
import TransactionItem from '@/components/transfers/TransactionItem';
import RecurringTransferItem from '@/components/transfers/RecurringTransferItem';
import { Textarea } from '@/components/ui/textarea';

const Transfers = () => {
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [description, setDescription] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [transferStep, setTransferStep] = useState(1);

  // Fetch accounts
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: DataService.getAccounts,
  });

  // Fetch beneficiaries
  const { data: beneficiaries = [], isLoading: isLoadingBeneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: DataService.getBeneficiaries,
  });

  // Fetch recent transfers (using the transactions endpoint as a proxy)
  const { data: recentTransfers = [], isLoading: isLoadingTransfers } = useQuery({
    queryKey: ['recentTransfers'],
    queryFn: DataService.getRecentTransactions,
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: (transferData: TransferData) => {
      return DataService.createTransfer(transferData);
    },
    onSuccess: () => {
      toast.success('Virement effectué avec succès', {
        description: `Virement de ${parseFloat(transferAmount).toLocaleString('fr-FR')}€ envoyé`,
      });
      // Reset form
      setTransferAmount('');
      setRecipient('');
      setSourceAccount('');
      setDescription('');
      setTransferDate('');
      setIsRecurring(false);
      setTransferStep(1);
    },
    onError: (error) => {
      toast.error('Erreur lors du virement', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    },
  });

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
      // Submit transfer
      const selectedAccount = accounts.find(a => a.id.toString() === sourceAccount);
      const selectedBeneficiary = beneficiaries.find(b => b.id === recipient);
      
      if (!selectedAccount || !selectedBeneficiary) {
        toast.error('Données invalides', {
          description: 'Compte source ou bénéficiaire non trouvé',
        });
        return;
      }

      const transferData: TransferData = {
        fromAccount: selectedAccount.id,
        toAccount: selectedBeneficiary.id,
        amount: parseFloat(transferAmount),
        description: description || undefined,
      };

      transferMutation.mutate(transferData);
    }
  };

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

  useEffect(() => {
    // Pre-select first account if available
    if (accounts.length > 0 && !sourceAccount) {
      setSourceAccount(accounts[0].id.toString());
    }
  }, [accounts, sourceAccount]);

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
                      <Select value={sourceAccount} onValueChange={setSourceAccount} disabled={isLoadingAccounts}>
                        <SelectTrigger id="source" className="bank-input">
                          <SelectValue placeholder={isLoadingAccounts ? "Chargement..." : "Sélectionnez un compte"} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.name} - {account.balance.toLocaleString('fr-FR')}€
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Bénéficiaire</Label>
                      <Select value={recipient} onValueChange={setRecipient} disabled={isLoadingBeneficiaries}>
                        <SelectTrigger id="recipient" className="bank-input">
                          <SelectValue placeholder={isLoadingBeneficiaries ? "Chargement..." : "Sélectionnez un bénéficiaire"} />
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
                      <Textarea
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

                  <Button 
                    onClick={handleNextStep} 
                    className="bank-button w-full"
                    disabled={transferMutation.isPending}
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
                    <Button 
                      onClick={() => setTransferStep(1)} 
                      className="bank-button-secondary w-full"
                      variant="outline"
                      disabled={transferMutation.isPending}
                    >
                      Modifier
                    </Button>
                    <Button 
                      onClick={handleNextStep} 
                      className="bank-button w-full"
                      disabled={transferMutation.isPending}
                    >
                      {transferMutation.isPending ? 'Traitement...' : 'Confirmer le virement'}
                    </Button>
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
              {isLoadingTransfers ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
                </div>
              ) : recentTransfers.length > 0 ? (
                <div className="space-y-4">
                  {recentTransfers.map((transfer) => (
                    <TransactionItem key={transfer.id} transaction={transfer} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Send className="h-12 w-12 text-bank-gray mb-3" />
                  <h3 className="text-lg font-medium mb-1">Aucun virement récent</h3>
                  <p className="text-bank-gray">Vos virements récents s'afficheront ici</p>
                </div>
              )}
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
                <RecurringTransferItem
                  title="Virement mensuel loyer"
                  beneficiary="Sophie Leroy"
                  frequency="Tous les 1er du mois"
                  amount={950}
                  onEdit={() => toast.info('Fonctionnalité à venir')}
                  onDelete={() => toast.info('Fonctionnalité à venir')}
                />
                
                <div className="flex justify-center py-4">
                  <Button variant="outline" className="bank-button-secondary flex items-center space-x-2">
                    <Send size={16} />
                    <span>Créer un nouveau virement programmé</span>
                  </Button>
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
