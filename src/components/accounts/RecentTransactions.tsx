
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions récentes</CardTitle>
        <CardDescription>Aperçu des dernières transactions sur vos comptes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-3">
              <div className="flex items-center space-x-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'credit' ? (
                    <ArrowDownRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-bank-dark">{transaction.description}</p>
                  <p className="text-sm text-bank-gray">{transaction.date}</p>
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
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
