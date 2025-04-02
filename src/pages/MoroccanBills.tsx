import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Receipt, AlertCircle, CheckCircle, Search, CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Bill, BillService } from '@/services/BillService';
import { AccountService } from '@/services/AccountService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format } from 'date-fns';
import { SmsValidationService } from '@/services/SmsValidationService';
import OTPValidationDialog from '@/components/transfers/OTPValidationDialog';

const MoroccanBills = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAccount, setPaymentAccount] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState<'all' | 'DGI' | 'CIM' | 'OTHER'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'thisYear'>('all');
  const [amountRange, setAmountRange] = useState<'all' | 'below500' | '500to1000' | 'above1000'>('all');
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [validationId, setValidationId] = useState<number | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Récupérer les factures
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['moroccanBills'],
    queryFn: BillService.getMoroccanBills,
  });
  
  // Récupérer les comptes
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });

  const isThisMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const isLastMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    let lastMonth = now.getMonth() - 1;
    let year = now.getFullYear();
    if (lastMonth < 0) {
      lastMonth = 11;
      year -= 1;
    }
    return date.getMonth() === lastMonth && date.getFullYear() === year;
  };

  const isThisYear = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getFullYear() === now.getFullYear();
  };
  
  const filteredBills = bills.filter((bill: Bill) => {
    const matchesSearch = 
      bill.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.amount.toString().includes(searchTerm));
    
    const matchesType = 
      billTypeFilter === 'all' || 
      bill.type === billTypeFilter;

    let matchesDate = true;
    if (dateFilter === 'thisMonth') {
      matchesDate = isThisMonth(bill.dueDate);
    } else if (dateFilter === 'lastMonth') {
      matchesDate = isLastMonth(bill.dueDate);
    } else if (dateFilter === 'thisYear') {
      matchesDate = isThisYear(bill.dueDate);
    }

    let matchesAmount = true;
    if (amountRange === 'below500') {
      matchesAmount = bill.amount < 500;
    } else if (amountRange === '500to1000') {
      matchesAmount = bill.amount >= 500 && bill.amount <= 1000;
    } else if (amountRange === 'above1000') {
      matchesAmount = bill.amount > 1000;
    }
    
    return matchesSearch && matchesType && matchesDate && matchesAmount;
  });
  
  const payBillMutation = useMutation({
    mutationFn: async (validationCode?: string) => {
      if (!selectedBill || !paymentAccount) {
        throw new Error('Information de paiement manquante');
      }
      return BillService.payBill(selectedBill.id, parseInt(paymentAccount), validationCode, validationId);
    },
    onSuccess: () => {
      toast.success('Facture payée avec succès', {
        description: `Paiement de la facture ${selectedBill?.reference} effectué`,
      });
      setConfirmDialogOpen(false);
      setSelectedBill(null);
      setIsOtpDialogOpen(false);
      setValidationId(null);
      queryClient.invalidateQueries({ queryKey: ['moroccanBills'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransfers'] });
    },
    onError: (error) => {
      toast.error('Erreur lors du paiement', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    },
  });

  const requestOtpMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBill || !paymentAccount) {
        throw new Error('Information de paiement manquante');
      }
      
      const account = accounts.find(a => a.id.toString() === paymentAccount);
      if (!account || !account.phone_number) {
        throw new Error('Numéro de téléphone non trouvé pour ce compte');
      }
      
      return SmsValidationService.requestSmsValidation(
        'paiement_facture',
        {
          billId: selectedBill.id,
          accountId: parseInt(paymentAccount),
          amount: selectedBill.amount
        },
        account.phone_number
      );
    },
    onSuccess: (data) => {
      setValidationId(data.validationId);
      setIsOtpDialogOpen(true);
      toast.success('Code OTP envoyé', {
        description: 'Veuillez saisir le code reçu par SMS pour confirmer le paiement'
      });
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'envoi du code OTP', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    },
    onSettled: () => {
      setIsRequestingOtp(false);
    }
  });
  
  const handlePayBill = (bill: Bill) => {
    setSelectedBill(bill);
    if (accounts.length > 0 && !paymentAccount) {
      setPaymentAccount(accounts[0].id.toString());
    }
    setConfirmDialogOpen(true);
  };
  
  const confirmPayment = () => {
    setIsRequestingOtp(true);
    requestOtpMutation.mutate();
  };

  const handleOtpValidate = async (code: string) => {
    try {
      await payBillMutation.mutateAsync(code);
      return true;
    } catch (error) {
      console.error('OTP validation error:', error);
      return false;
    }
  };
  
  const getBillTypeIcon = (type: string) => {
    switch (type) {
      case 'DGI':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'CIM':
        return <Receipt className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setBillTypeFilter('all');
    setDateFilter('all');
    setAmountRange('all');
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Factures Marocaines</h1>
        <p className="text-bank-gray">Consultez et payez vos factures DGI et CIM</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recherche et filtres</CardTitle>
          <CardDescription>Affinez vos résultats selon vos besoins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-bank-gray" />
              </div>
              <Input
                placeholder="Rechercher par référence, description, montant..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="type-filter" className="mb-2 block text-sm">Type de facture</Label>
              <Select value={billTypeFilter} onValueChange={(v) => setBillTypeFilter(v as 'all' | 'DGI' | 'CIM' | 'OTHER')}>
                <SelectTrigger id="type-filter" className="w-full">
                  <SelectValue placeholder="Toutes les factures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les factures</SelectItem>
                  <SelectItem value="DGI">DGI</SelectItem>
                  <SelectItem value="CIM">CIM</SelectItem>
                  <SelectItem value="OTHER">Autres</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-filter" className="mb-2 block text-sm">Période</Label>
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as 'all' | 'thisMonth' | 'lastMonth' | 'thisYear')}>
                <SelectTrigger id="date-filter">
                  <SelectValue placeholder="Toutes les périodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
                  <SelectItem value="lastMonth">Mois dernier</SelectItem>
                  <SelectItem value="thisYear">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount-filter" className="mb-2 block text-sm">Montant</Label>
              <Select value={amountRange} onValueChange={(v) => setAmountRange(v as 'all' | 'below500' | '500to1000' | 'above1000')}>
                <SelectTrigger id="amount-filter">
                  <SelectValue placeholder="Tous les montants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les montants</SelectItem>
                  <SelectItem value="below500">Moins de 500 MAD</SelectItem>
                  <SelectItem value="500to1000">Entre 500 et 1000 MAD</SelectItem>
                  <SelectItem value="above1000">Plus de 1000 MAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end md:col-span-4">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Factures à payer</TabsTrigger>
          <TabsTrigger value="paid">Factures payées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Factures en attente de paiement</CardTitle>
              <CardDescription>Consultez et payez vos factures non réglées</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBills ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
                </div>
              ) : filteredBills.filter(bill => bill.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {filteredBills
                    .filter(bill => bill.status === 'pending')
                    .map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                            {getBillTypeIcon(bill.type)}
                          </div>
                          <div>
                            <p className="font-medium">{bill.description}</p>
                            <div className="flex space-x-2 text-sm text-bank-gray">
                              <span>{bill.reference}</span>
                              <span>•</span>
                              <span>Échéance: {formatDate(bill.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-red-600">{bill.amount.toLocaleString('fr-MA')} MAD</p>
                            <div className="mt-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
                              À payer
                            </div>
                          </div>
                          <Button 
                            onClick={() => handlePayBill(bill)}
                            className="bg-bank-primary hover:bg-bank-primary-dark"
                            disabled={payBillMutation.isPending}
                          >
                            Payer
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                    <CheckCircle className="h-8 w-8 text-bank-gray" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Aucune facture en attente</h3>
                  <p className="text-bank-gray">
                    {searchTerm || billTypeFilter !== 'all' || dateFilter !== 'all' || amountRange !== 'all' 
                      ? "Aucune facture ne correspond à vos critères de recherche" 
                      : "Vous n'avez pas de factures non payées pour le moment"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Factures payées</CardTitle>
              <CardDescription>Historique de vos factures réglées</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBills ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
                </div>
              ) : filteredBills.filter(bill => bill.status === 'paid').length > 0 ? (
                <div className="space-y-4">
                  {filteredBills
                    .filter(bill => bill.status === 'paid')
                    .map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{bill.description}</p>
                            <div className="flex space-x-2 text-sm text-bank-gray">
                              <span>{bill.reference}</span>
                              <span>•</span>
                              <span>Payé le: {formatDate(bill.paymentDate || '')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-bank-gray">{bill.amount.toLocaleString('fr-MA')} MAD</p>
                          <div className="mt-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                            Payée
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                    <Receipt className="h-8 w-8 text-bank-gray" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Aucune facture payée</h3>
                  <p className="text-bank-gray">
                    {searchTerm || billTypeFilter !== 'all' || dateFilter !== 'all' || amountRange !== 'all'
                      ? "Aucune facture ne correspond à vos critères de recherche"
                      : "L'historique de vos paiements s'affichera ici"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer le paiement</DialogTitle>
            <DialogDescription>
              Vérifiez les détails avant de procéder au paiement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {selectedBill && (
              <div className="rounded-xl bg-bank-gray-light p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-bank-gray">Facture :</span>
                    <span className="font-medium">{selectedBill.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bank-gray">Référence :</span>
                    <span className="font-medium">{selectedBill.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bank-gray">Émetteur :</span>
                    <span className="font-medium">{selectedBill.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bank-gray">Montant :</span>
                    <span className="font-medium text-red-600">{selectedBill.amount.toLocaleString('fr-MA')} MAD</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="payment-account">Compte de paiement</Label>
              <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                <SelectTrigger id="payment-account" className="bank-input">
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
            
            <div className="flex items-center p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="text-amber-500 mr-2 h-5 w-5" />
              <p className="text-sm text-amber-700">
                Ce paiement sera validé par code SMS pour votre sécurité.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmPayment} 
              disabled={!paymentAccount || isRequestingOtp || payBillMutation.isPending}
            >
              {isRequestingOtp ? (
                <>
                  <span className="animate-spin mr-2">⭘</span>
                  Envoi du code...
                </>
              ) : (
                'Procéder au paiement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OTPValidationDialog 
        isOpen={isOtpDialogOpen}
        onClose={() => setIsOtpDialogOpen(false)}
        onValidate={handleOtpValidate}
        isValidating={payBillMutation.isPending}
      />
    </AppLayout>
  );
};

export default MoroccanBills;
