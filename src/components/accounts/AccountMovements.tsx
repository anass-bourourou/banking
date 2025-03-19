
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Search, Calendar, Filter } from 'lucide-react';
import { Transaction } from '@/services/TransactionService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AccountMovementsProps {
  transactions: Transaction[];
  showFilters?: boolean;
}

const AccountMovements: React.FC<AccountMovementsProps> = ({ transactions, showFilters = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Formatter les dates
  const formatDate = (dateString: string) => {
    // Vérifier si la date est au format "DD/MM/YYYY"
    if (/\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    
    // Sinon, considérer que c'est une date ISO
    return new Date(dateString);
  };

  // Filtrer les transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filtrer par recherche
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtrer par type
    const matchesType = 
      transactionType === "all" || 
      (transactionType === "credit" && transaction.type === "credit") || 
      (transactionType === "debit" && transaction.type === "debit");
    
    // Filtrer par date
    const transactionDate = formatDate(transaction.date);
    const matchesDateFrom = !dateFrom || transactionDate >= dateFrom;
    const matchesDateTo = !dateTo || transactionDate <= dateTo;
    
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  // Trier les transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = formatDate(a.date).getTime();
    const dateB = formatDate(b.date).getTime();
    
    if (sortOrder === "newest") {
      return dateB - dateA;
    } else if (sortOrder === "oldest") {
      return dateA - dateB;
    } else if (sortOrder === "highest") {
      return b.amount - a.amount;
    } else if (sortOrder === "lowest") {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Formatter pour l'affichage
  const formatDisplayDate = (dateString: string) => {
    // Si la date est déjà au format "DD/MM/YYYY"
    if (/\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      return dateString;
    }
    
    // Sinon, on formate la date ISO
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: fr });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setTransactionType('all');
    setSortOrder('newest');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-bank-gray-light p-4 md:p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-xl">Mouvements du compte</CardTitle>
            <CardDescription>Historique des transactions</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {showFilters && (
        <div className="border-b border-bank-gray-light p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
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
            
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="bank-input">
                <SelectValue placeholder="Type de transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="credit">Crédit</SelectItem>
                <SelectItem value="debit">Débit</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'P', { locale: fr }) : 'Date de début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'P', { locale: fr }) : 'Date de fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex space-x-2">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="bank-input">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="highest">Montant le plus élevé</SelectItem>
                  <SelectItem value="lowest">Montant le plus faible</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={resetFilters}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="max-h-[600px] overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-bank-gray-light"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDown className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUp className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-bank-dark">{transaction.description}</p>
                    <div className="flex space-x-2 text-sm text-bank-gray">
                      {transaction.category && <span>{transaction.category}</span>}
                      {transaction.category && <span>•</span>}
                      <span>{formatDisplayDate(transaction.date)}</span>
                      {transaction.reference_id && (
                        <>
                          <span>•</span>
                          <span>Réf: {transaction.reference_id}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`font-medium ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'} 
                    {transaction.amount.toLocaleString('fr-MA', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} MAD
                  </div>
                  <div className="text-xs text-bank-gray">
                    {transaction.status === 'completed' ? 'Terminé' : 
                     transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                    {transaction.fees && transaction.fees > 0 && 
                      ` • Frais: ${transaction.fees.toLocaleString('fr-MA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} MAD`
                    }
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-bank-gray">Aucune transaction trouvée</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountMovements;
