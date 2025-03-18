
import React from 'react';
import { CreditCard, ArrowUp, ArrowDown } from 'lucide-react';

interface BalanceCardProps {
  accountType: string;
  accountNumber: string;
  balance: number;
  currency?: string;
  change?: {
    amount: number;
    percentage: number;
    increase: boolean;
  };
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  accountType,
  accountNumber,
  balance,
  currency = "MAD",
  change,
}) => {
  const formattedBalance = balance.toLocaleString('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="group overflow-hidden rounded-2xl bg-white p-6 shadow-card card-hover-effect">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
            <CreditCard className="h-5 w-5 text-bank-primary" />
          </div>
          <div>
            <h3 className="font-medium text-bank-dark">{accountType}</h3>
            <p className="text-sm text-bank-gray">**** {accountNumber.slice(-4)}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 rounded-full px-3 py-1 text-sm ${
            change.increase ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {change.increase ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{change.percentage}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-bank-gray">Solde disponible</p>
        <h2 className="mt-1 text-3xl font-bold text-bank-dark">
          {formattedBalance} {currency}
        </h2>
      </div>
      
      {change && (
        <div className="mt-4 text-sm">
          <span className="text-bank-gray">
            {change.increase ? 'Augmentation' : 'Diminution'} de{' '}
            <span className={change.increase ? 'text-green-600' : 'text-red-600'}>
              {change.amount.toLocaleString('fr-MA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </span>{' '}
            ce mois-ci
          </span>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
