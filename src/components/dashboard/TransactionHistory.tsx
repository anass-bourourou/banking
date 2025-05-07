
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TransactionService } from '@/services/TransactionService';
import { Transaction } from '@/types/transaction';
import { Skeleton } from '@/components/ui/skeleton';

const TransactionHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: TransactionService.getRecentTransactions,
  });
  
  const filteredTransactions = transactions?.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-MA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="border-b border-bank-gray-light p-4 md:p-6">
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <h3 className="text-lg font-semibold text-bank-dark">Transactions récentes</h3>
          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-bank-gray" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des transactions..."
              className="h-10 w-full rounded-lg border-0 bg-bank-gray-light pl-10 pr-4 text-sm text-bank-dark focus:outline-none focus:ring-1 focus:ring-bank-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl p-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-1 h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction: Transaction) => (
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
                    <p className="text-sm text-bank-gray">
                      {transaction.category || 'Non classé'} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'} 
                  {transaction.amount.toLocaleString('fr-MA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} MAD
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-bank-gray">Aucune transaction trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
