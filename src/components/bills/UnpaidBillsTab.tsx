
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle, Search, FilterX } from 'lucide-react';
import { Bill } from '@/services/BillService';
import BillCard from './BillCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface UnpaidBillsTabProps {
  bills: Bill[];
  isLoading: boolean;
  isLoadingAccounts: boolean;
  onPayBill: (bill: Bill) => void;
}

const UnpaidBillsTab: React.FC<UnpaidBillsTabProps> = ({
  bills,
  isLoading,
  isLoadingAccounts,
  onPayBill
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'DGI' | 'CIM' | 'OTHER'>('all');
  const [sortOrder, setSortOrder] = useState<'dueDate' | 'amountAsc' | 'amountDesc'>('dueDate');

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(bill.amount).includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || bill.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (sortOrder) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'amountAsc':
        return a.amount - b.amount;
      case 'amountDesc':
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSortOrder('dueDate');
  };

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
          <h3 className="text-lg font-medium">Aucune facture en attente</h3>
          <p className="text-bank-gray">Vous n'avez pas de factures à payer pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  // Group bills by type before filtering
  const dgiUnpaidBills = sortedBills.filter(bill => bill.type === 'DGI');
  const cimUnpaidBills = sortedBills.filter(bill => bill.type === 'CIM');
  const otherUnpaidBills = sortedBills.filter(bill => bill.type === 'OTHER');

  const noResultsFound = filteredBills.length === 0 && (searchTerm || typeFilter !== 'all');

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Recherche et filtres</CardTitle>
          <CardDescription>Filtrez vos factures à payer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-bank-gray" />
              </div>
              <Input
                placeholder="Rechercher par référence ou description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | 'DGI' | 'CIM' | 'OTHER')}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de facture" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="DGI">DGI</SelectItem>
                  <SelectItem value="CIM">CIM</SelectItem>
                  <SelectItem value="OTHER">Autres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'dueDate' | 'amountAsc' | 'amountDesc')}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Date d'échéance</SelectItem>
                  <SelectItem value="amountAsc">Montant croissant</SelectItem>
                  <SelectItem value="amountDesc">Montant décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || typeFilter !== 'all' || sortOrder !== 'dueDate') && (
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="flex items-center"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {noResultsFound ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-10 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
          <h3 className="text-lg font-medium">Aucun résultat trouvé</h3>
          <p className="text-bank-gray">Aucune facture ne correspond à vos critères de recherche</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="mt-4"
          >
            Effacer les filtres
          </Button>
        </div>
      ) : (
        <>
          {/* Factures DGI */}
          {dgiUnpaidBills.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-semibold">Factures DGI</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dgiUnpaidBills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    isPaid={false}
                    isLoading={isLoadingAccounts}
                    onPayBill={onPayBill}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Factures CIM */}
          {cimUnpaidBills.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-semibold">Factures CIM</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cimUnpaidBills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    isPaid={false}
                    isLoading={isLoadingAccounts}
                    onPayBill={onPayBill}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Autres factures */}
          {otherUnpaidBills.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-semibold">Autres Factures</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherUnpaidBills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    isPaid={false}
                    isLoading={isLoadingAccounts}
                    onPayBill={onPayBill}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UnpaidBillsTab;
