
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Download, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

const Receipts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const transferReceipts = [
    { id: 1, recipient: 'Marie Durand', amount: 150.00, date: '15/10/2023', reference: 'VIR-15102023-MD' },
    { id: 2, recipient: 'Pierre Martin', amount: 75.00, date: '05/10/2023', reference: 'VIR-05102023-PM' },
    { id: 3, recipient: 'Sophie Leroy', amount: 200.00, date: '28/09/2023', reference: 'VIR-28092023-SL' },
  ];
  
  const paymentReceipts = [
    { id: 1, payee: 'EDF Électricité', amount: 92.30, date: '25/09/2023', reference: 'FACT-2309-EDF' },
    { id: 2, payee: 'Orange Télécom', amount: 39.99, date: '03/10/2023', reference: 'FACT-2310-ORG' },
    { id: 3, payee: 'SAUR Eau', amount: 43.75, date: '10/10/2023', reference: 'FACT-2310-SAUR' },
    { id: 4, payee: 'Assurance Habitation', amount: 28.50, date: '12/10/2023', reference: 'PRIME-OCT23' },
  ];
  
  const depositReceipts = [
    { id: 1, source: 'Virement entrant - Employeur', amount: 2500.00, date: '28/09/2023', reference: 'SAL-SEPT23' },
    { id: 2, source: 'Remboursement - CPAM', amount: 35.60, date: '10/10/2023', reference: 'CPAM-OCT23' },
  ];
  
  const dateFilters = [
    { id: '', name: 'Toutes les dates' },
    { id: 'current', name: 'Mois courant' },
    { id: 'last', name: 'Mois dernier' },
    { id: 'lastThree', name: 'Trois derniers mois' },
  ];
  
  const typeFilters = [
    { id: '', name: 'Tous les types' },
    { id: 'transfer', name: 'Virements' },
    { id: 'payment', name: 'Paiements' },
    { id: 'deposit', name: 'Dépôts' },
  ];
  
  const handleDownload = (type: string, id: number) => {
    let receiptDetails;
    
    if (type === 'transfer') {
      receiptDetails = transferReceipts.find(r => r.id === id);
      toast.success('Reçu téléchargé', {
        description: `Le reçu du virement à ${receiptDetails?.recipient} a été téléchargé`,
      });
    } else if (type === 'payment') {
      receiptDetails = paymentReceipts.find(r => r.id === id);
      toast.success('Reçu téléchargé', {
        description: `Le reçu du paiement à ${receiptDetails?.payee} a été téléchargé`,
      });
    } else if (type === 'deposit') {
      receiptDetails = depositReceipts.find(r => r.id === id);
      toast.success('Reçu téléchargé', {
        description: `Le reçu du dépôt ${receiptDetails?.source} a été téléchargé`,
      });
    }
  };
  
  const filteredTransferReceipts = transferReceipts.filter(receipt => 
    receipt.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPaymentReceipts = paymentReceipts.filter(receipt => 
    receipt.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredDepositReceipts = depositReceipts.filter(receipt => 
    receipt.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Reçus</h1>
        <p className="text-bank-gray">Consultez et téléchargez vos reçus de paiements et de virements</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Mes reçus</CardTitle>
            <CardDescription>Tous vos reçus de transactions</CardDescription>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <div className="relative sm:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={16} className="text-bank-gray" />
              </div>
              <Input
                type="text"
                placeholder="Rechercher..."
                className="bank-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type-filter">Type de reçu</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter" className="bank-input">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  {typeFilters.map((filter) => (
                    <SelectItem key={filter.id} value={filter.id}>{filter.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-filter">Période</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date-filter" className="bank-input">
                  <SelectValue placeholder="Toutes les dates" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilters.map((filter) => (
                    <SelectItem key={filter.id} value={filter.id}>{filter.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="transfers">Virements</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
              <TabsTrigger value="deposits">Dépôts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {(filteredTransferReceipts.length > 0 || filteredPaymentReceipts.length > 0 || filteredDepositReceipts.length > 0) ? (
                <>
                  {filteredTransferReceipts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Reçus de virements</h3>
                      <div className="space-y-3">
                        {filteredTransferReceipts.map((receipt) => (
                          <div 
                            key={receipt.id} 
                            className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <ArrowUpRight className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Virement à {receipt.recipient}</p>
                                <div className="flex space-x-2 text-sm text-bank-gray">
                                  <span>{receipt.date}</span>
                                  <span>•</span>
                                  <span>{receipt.reference}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-red-600">{receipt.amount.toLocaleString('fr-FR')} €</p>
                              <button 
                                onClick={() => handleDownload('transfer', receipt.id)} 
                                className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90"
                                title="Télécharger"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {filteredPaymentReceipts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Reçus de paiements</h3>
                      <div className="space-y-3">
                        {filteredPaymentReceipts.map((receipt) => (
                          <div 
                            key={receipt.id} 
                            className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <Receipt className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Paiement à {receipt.payee}</p>
                                <div className="flex space-x-2 text-sm text-bank-gray">
                                  <span>{receipt.date}</span>
                                  <span>•</span>
                                  <span>{receipt.reference}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-red-600">{receipt.amount.toLocaleString('fr-FR')} €</p>
                              <button 
                                onClick={() => handleDownload('payment', receipt.id)} 
                                className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90"
                                title="Télécharger"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {filteredDepositReceipts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Reçus de dépôts</h3>
                      <div className="space-y-3">
                        {filteredDepositReceipts.map((receipt) => (
                          <div 
                            key={receipt.id} 
                            className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <ArrowDownRight className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{receipt.source}</p>
                                <div className="flex space-x-2 text-sm text-bank-gray">
                                  <span>{receipt.date}</span>
                                  <span>•</span>
                                  <span>{receipt.reference}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-green-600">{receipt.amount.toLocaleString('fr-FR')} €</p>
                              <button 
                                onClick={() => handleDownload('deposit', receipt.id)} 
                                className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90"
                                title="Télécharger"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                    <Receipt size={24} className="text-bank-gray" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Aucun reçu trouvé</h3>
                  <p className="text-bank-gray">
                    {searchTerm 
                      ? "Aucun résultat ne correspond à votre recherche" 
                      : "Vous n'avez pas encore de reçus disponibles"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="transfers" className="space-y-4">
              {filteredTransferReceipts.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransferReceipts.map((receipt) => (
                    <div 
                      key={receipt.id} 
                      className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Virement à {receipt.recipient}</p>
                          <div className="flex space-x-2 text-sm text-bank-gray">
                            <span>{receipt.date}</span>
                            <span>•</span>
                            <span>{receipt.reference}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-red-600">{receipt.amount.toLocaleString('fr-FR')} €</p>
                        <button 
                          onClick={() => handleDownload('transfer', receipt.id)} 
                          className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90"
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                    <Receipt size={24} className="text-bank-gray" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Aucun reçu de virement trouvé</h3>
                  <p className="text-bank-gray">
                    {searchTerm 
                      ? "Aucun résultat ne correspond à votre recherche" 
                      : "Vous n'avez pas encore de reçus de virements disponibles"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              {filteredPaymentReceipts.length > 0 ? (
                <div className="space-y-3">
                  {filteredPaymentReceipts.map((receipt) => (
                    <div 
                      key={receipt.id} 
                      className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <Receipt className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Paiement à {receipt.payee}</p>
                          <div className="flex space-x-2 text-sm text-bank-gray">
                            <span>{receipt.date}</span>
                            <span>•</span>
                            <span>{receipt.reference}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-red-600">{receipt.amount.toLocaleString('fr-FR')} €</p>
                        <button 
                          onClick={() => handleDownload('payment', receipt.id)} 
                          className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90"
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                    <Receipt size={24} className="text-bank-gray" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Aucun reçu de paiement trouvé</h3>
                  <p className="text-bank-gray">
                    {searchTerm 
                      ? "Aucun résultat ne correspond à votre recherche" 
                      : "Vous n'avez pas encore de reçus de paiements disponibles"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="deposits" className="space-y-4">
              {filteredDepositReceipts.length > 0 ? (
                <div className="space-y-3">
                  {filteredDepositReceipts.map((receipt) => (
                    <div 
                      key={receipt.id} 
                      className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <ArrowDownRight className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{receipt.source}</p>
                          <div className="flex space-x-2 text-sm text-bank-gray">
                            <span>{receipt.date}</span>
                            <span>•</span>
                            <span>{receipt.reference}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-green-600">{receipt.amount.toLocaleString('fr-FR')} €</p>
                        <button 
                          onClick={() => handleDownload('deposit', receipt.id)} 
                          className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90"
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                    <Receipt size={24} className="text-bank-gray" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Aucun reçu de dépôt trouvé</h3>
                  <p className="text-bank-gray">
                    {searchTerm 
                      ? "Aucun résultat ne correspond à votre recherche" 
                      : "Vous n'avez pas encore de reçus de dépôts disponibles"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Receipts;
