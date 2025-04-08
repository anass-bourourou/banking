
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Transaction } from '@/services/TransactionService';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  // Formatter les dates pour l'affichage
  const formatDisplayDate = (dateString: string) => {
    // Si la date est déjà au format "DD/MM/YYYY"
    if (/\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      return dateString;
    }
    
    // Sinon, on formate la date ISO
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };

  return (
    <div
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
  );
};

export default TransactionItem;
