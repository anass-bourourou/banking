
import React from 'react';
import { Transaction } from '@/services/TransactionService';
import TransactionItem from './TransactionItem';

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  return (
    <div className="space-y-4">
      {transactions.length > 0 ? (
        transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-bank-gray">Aucune transaction trouvée</p>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
