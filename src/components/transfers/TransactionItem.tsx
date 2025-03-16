
import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/services/DataService';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionItemProps {
  transaction: Transaction;
  detailed?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, detailed = false }) => {
  const isCredit = transaction.type === 'credit';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return "Aujourd'hui";
    } else if (isYesterday(date)) {
      return 'Hier';
    } else {
      return format(date, 'd MMMM yyyy', { locale: fr });
    }
  };

  return (
    <div className={`flex items-center justify-between rounded-lg border border-bank-gray-light p-4 ${
      detailed ? 'mb-4 hover:bg-bank-gray-light/40 transition-colors' : ''
    }`}>
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
          <p className="text-sm text-bank-gray">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'}{transaction.amount.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} €
        </p>
        {detailed && transaction.category && (
          <p className="text-sm text-bank-gray">{transaction.category}</p>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
