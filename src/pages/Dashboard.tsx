
import React from 'react';
import { Card } from '@/components/ui/card';
import BalanceCard from '@/components/dashboard/BalanceCard';
import AccountsSummary from '@/components/dashboard/AccountsSummary';
import SpendingChart from '@/components/dashboard/SpendingChart';
import QuickActions from '@/components/dashboard/QuickActions';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Fetch accounts from backend
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => AccountService.getAccounts(),
  });

  // Sample spending data for the chart - this would come from your backend in a real implementation
  const spendingData = [
    { name: 'Alimentation', value: 3500, color: '#4CAF50' },
    { name: 'Transport', value: 1800, color: '#2196F3' },
    { name: 'Logement', value: 6200, color: '#FF9800' },
    { name: 'Loisirs', value: 1200, color: '#9C27B0' },
    { name: 'Santé', value: 800, color: '#F44336' }
  ];

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : accounts && accounts.length > 0 ? (
            <BalanceCard 
              accountType={accounts[0].name}
              accountNumber={accounts[0].number}
              balance={accounts[0].balance}
              currency="MAD"
              change={{
                amount: accounts[0].history?.length > 1 
                  ? accounts[0].balance - accounts[0].history[accounts[0].history.length - 2].amount
                  : 0,
                percentage: accounts[0].history?.length > 1
                  ? parseFloat(((accounts[0].balance - accounts[0].history[accounts[0].history.length - 2].amount) 
                    / accounts[0].history[accounts[0].history.length - 2].amount * 100).toFixed(1))
                  : 0,
                increase: accounts[0].history?.length > 1
                  ? accounts[0].balance > accounts[0].history[accounts[0].history.length - 2].amount
                  : true
              }}
            />
          ) : (
            <Card className="p-6">
              <p>Aucun compte disponible</p>
            </Card>
          )}
        </div>
        <div>
          <NotificationsPanel />
        </div>
      </div>
      
      <AccountsSummary />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Dépenses mensuelles</h2>
            <SpendingChart data={spendingData} />
          </Card>
        </div>
        <div>
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Soldes des comptes</h2>
            <p className="text-sm text-muted-foreground">Vue d'ensemble de tous vos comptes</p>
            <Separator className="my-4" />
            {isLoading ? (
              <div className="flex h-20 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-bank-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {accounts?.map(account => (
                  <div key={account.id} className="flex items-center justify-between">
                    <span>{account.name}</span>
                    <span className="font-semibold">{account.balance.toLocaleString('fr-MA', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {account.currency}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Actions rapides</h2>
        <QuickActions />
      </div>
      
      <TransactionHistory />
    </div>
  );
};

export default Dashboard;
