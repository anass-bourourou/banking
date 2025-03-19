
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Receipt, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Bill, BillService } from '@/services/BillService';
import { AccountService } from '@/services/AccountService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const MoroccanBills = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAccount, setPaymentAccount] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState<'all' | 'DGI' | 'CIM'>('all');
  
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
  
  // Filtrer les factures en fonction des critères
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      billTypeFilter === 'all' || 
      bill.type === billTypeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Mutation pour le paiement de facture
  const payBillMutation = useMutation({
    mutationFn: () => {
      if (!selectedBill || !paymentAccount) {
        throw new Error('Information de paiement manquante');
      }
      return BillService.payBill(selectedBill.id, parseInt(paymentAccount));
    },
    onSuccess: () => {
      toast.success('Facture payée avec succès', {
        description: `Paiement de la facture ${selectedBill?.reference} effectué`,
      });
      setConfirmDialogOpen(false);
      setSelectedBill(null);
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
  
  const handlePayBill = (bill: Bill) => {
    setSelectedBill(bill);
    // Présélectionner le premier compte si disponible
    if (accounts.length > 0 && !paymentAccount) {
      setPaymentAccount(accounts[0].id.toString());
    }
    setConfirmDialogOpen(true);
  };
  
  const confirmPayment = () => {
    payBillMutation.mutate();
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
    return date.toLocaleDateString('fr-MA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Factures Marocaines</h1>
        <p className="text-bank-gray">Consultez et payez vos factures DGI et CIM</p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-bank-gray" />
              </div>
              <Input
                placeholder="Rechercher une facture..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={billTypeFilter} onValueChange={(v) => setBillTypeFilter(v as 'all' | 'DGI' | 'CIM')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type de facture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les factures</SelectItem>
                <SelectItem value="DGI">DGI</SelectItem>
                <SelectItem value="CIM">CIM</SelectItem>
              </SelectContent>
            </Select>
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
                    Vous n'avez pas de factures non payées pour le moment
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
                    L'historique de vos paiements s'affichera ici
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogue de confirmation de paiement */}
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
                Ce paiement sera immédiatement débité de votre compte.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={payBillMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              onClick={confirmPayment}
              className="bg-bank-primary hover:bg-bank-primary-dark"
              disabled={payBillMutation.isPending || !paymentAccount}
            >
              {payBillMutation.isPending ? 'Traitement...' : 'Confirmer le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default MoroccanBills;
