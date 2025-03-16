
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DataService, Account } from '@/services/DataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, PieChart, LineChart, TrendingUp, Loader2 } from 'lucide-react';

const AccountsSummary: React.FC = () => {
  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: DataService.getAccounts,
  });

  const getTotalBalance = (): number => {
    if (!accounts || accounts.length === 0) return 0;
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const getAccountGrowth = (): number => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Calculate total balance change from last month
    let currentTotal = 0;
    let previousTotal = 0;
    
    accounts.forEach(account => {
      currentTotal += account.balance;
      const historyLength = account.history.length;
      if (historyLength > 1) {
        previousTotal += account.history[historyLength - 2].amount;
      } else if (historyLength === 1) {
        // If only one history item, use it as previous
        previousTotal += account.history[0].amount;
      } else {
        // No history, use current balance
        previousTotal += account.balance;
      }
    });
    
    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-card">
        <CardContent className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !accounts) {
    return (
      <Card className="overflow-hidden shadow-card">
        <CardContent className="p-6 text-center">
          <p className="text-bank-gray">Impossible de charger les informations des comptes</p>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = getTotalBalance();
  const growth = getAccountGrowth();
  const formattedTotalBalance = totalBalance.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="border-b border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Résumé des comptes</CardTitle>
          <Link to="/accounts">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-bank-primary">
              Voir tous <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-bank-primary/10 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/20">
              <Wallet className="h-5 w-5 text-bank-primary" />
            </div>
            <h4 className="text-sm font-medium text-bank-gray">Balance totale</h4>
            <p className="mt-1 text-xl font-bold text-bank-dark">{formattedTotalBalance} €</p>
          </div>
          
          <div className="rounded-xl bg-green-100 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-200">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-bank-gray">Évolution</h4>
            <p className="mt-1 text-xl font-bold text-bank-dark">
              {growth > 0 ? '+' : ''}{growth.toFixed(2)}%
            </p>
          </div>
          
          <div className="rounded-xl bg-purple-100 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-200">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-bank-gray">Comptes actifs</h4>
            <p className="mt-1 text-xl font-bold text-bank-dark">{accounts.length}</p>
          </div>
          
          <div className="rounded-xl bg-amber-100 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-200">
              <LineChart className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="text-sm font-medium text-bank-gray">Prévision mensuelle</h4>
            <p className="mt-1 text-xl font-bold text-bank-dark">+2.4%</p>
          </div>
        </div>
        
        <h3 className="mb-4 text-lg font-medium">Vos comptes</h3>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div 
              key={account.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-bank-dark">{account.name}</h4>
                <p className="text-sm text-bank-gray">**** {account.number.slice(-4)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-bank-dark">
                  {account.balance.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} €
                </p>
                {account.history.length > 1 && (
                  <p className={`text-sm ${
                    account.balance > account.history[account.history.length - 2].amount
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {account.balance > account.history[account.history.length - 2].amount ? '+' : ''}
                    {(account.balance - account.history[account.history.length - 2].amount).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} €
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountsSummary;
