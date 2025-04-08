
import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TransactionsFilter from './TransactionsFilter';
import TransactionsList from './TransactionsList';

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
        <TransactionsFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          transactionType={transactionType}
          setTransactionType={setTransactionType}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          resetFilters={resetFilters}
        />
      )}
      
      <CardContent className="max-h-[600px] overflow-y-auto p-4 md:p-6">
        <TransactionsList transactions={sortedTransactions} />
      </CardContent>
    </Card>
  );
};

export default AccountMovements;
