
import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionItemProps {
  transaction: any;
  detailed?: boolean;
  onClick?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  detailed = false,
  onClick
}) => {
  const isCredit = transaction.type === 'credit';
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      // Use parseISO to safely parse ISO date strings
      const date = parseISO(dateString);
      
      // Verify that the date is valid
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      if (isToday(date)) {
        return "Aujourd'hui";
      } else if (isYesterday(date)) {
        return 'Hier';
      } else {
        return format(date, 'd MMMM yyyy', { locale: fr });
      }
    } catch (error) {
      console.error(`Error formatting date ${dateString}:`, error);
      return 'Date invalide';
    }
  };

  return (
    <div 
      className={`flex items-center justify-between rounded-lg border border-bank-gray-light p-4 ${
        detailed ? 'mb-4 hover:bg-bank-gray-light/40 transition-colors' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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
          <div className="text-sm text-bank-gray flex flex-wrap gap-1">
            <span>{formatDate(transaction.date)}</span>
            {transaction.transfer_type && (
              <>
                <span>•</span>
                <span>{transaction.transfer_type === 'instantané' ? 'Virement instantané' : 
                      transaction.transfer_type === 'multiple' ? 'Virement multiple' : 
                      'Virement standard'}</span>
              </>
            )}
            {transaction.reference_id && (
              <>
                <span>•</span>
                <span>Réf: {transaction.reference_id}</span>
              </>
            )}
          </div>
          {transaction.recipient_name && (
            <p className="text-sm text-bank-primary">Destinataire: {transaction.recipient_name}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'}{transaction.amount.toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} MAD
        </p>
        {detailed && transaction.category && (
          <p className="text-sm text-bank-gray">{transaction.category}</p>
        )}
        {transaction.status && (
          <p className={`text-xs ${
            transaction.status === 'completed' ? 'text-green-600' : 
            transaction.status === 'pending' ? 'text-amber-600' : 'text-red-600'
          }`}>
            {transaction.status === 'completed' ? 'Terminé' : 
             transaction.status === 'pending' ? 'En attente' : 'Échoué'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
