
import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/services/DataService';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isCredit = transaction.type === 'credit';
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
      <div className="flex items-center space-x-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isCredit ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isCredit ? (
            <ArrowDownRight className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-bank-gray">{transaction.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'}{transaction.amount.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} €
        </p>
        {transaction.description && (
          <p className="text-sm text-bank-gray">{transaction.description}</p>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
