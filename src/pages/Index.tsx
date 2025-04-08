import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import AccountsSummary from '@/components/dashboard/AccountsSummary';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import SpendingChart from '@/components/dashboard/SpendingChart';
import QuickActions from '@/components/dashboard/QuickActions';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService } from '@/services/AccountService';
import { Loader2 } from 'lucide-react';
import RecentTransactions from '@/components/accounts/RecentTransactions';
import { TransactionService, Transaction } from '@/services/TransactionService';

const Index = () => {
  const { user } = useAuth();
  
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: TransactionService.getRecentTransactions,
  });

  const spendingData = [
    { name: 'Logement', value: 2500, color: '#0F7DEA' },
    { name: 'Alimentation', value: 1200, color: '#10B981' },
    { name: 'Transport', value: 600, color: '#F59E0B' },
    { name: 'Loisirs', value: 800, color: '#8B5CF6' },
    { name: 'Santé', value: 400, color: '#EC4899' },
    { name: 'Autres', value: 700, color: '#6B7280' },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Anass';

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Bonjour, {firstName}</h1>
        <p className="text-bank-gray">Bienvenue dans votre espace bancaire personnel</p>
      </div>

      {isLoadingAccounts ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accounts?.slice(0, 3).map((account) => (
            <BalanceCard
              key={account.id}
              accountType={account.name}
              accountNumber={account.number}
              balance={account.balance}
              currency="MAD"
              change={{
                amount: account.history.length > 1 
                  ? account.balance - account.history[account.history.length - 2].amount 
                  : 0,
                percentage: account.history.length > 1 
                  ? parseFloat(((account.balance - account.history[account.history.length - 2].amount) / account.history[account.history.length - 2].amount * 100).toFixed(1))
                  : 0,
                increase: account.history.length > 1 
                  ? account.balance > account.history[account.history.length - 2].amount
                  : true,
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold">Mouvements récents</h2>
        {isLoadingTransactions ? (
          <div className="flex h-20 w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-bank-primary" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <RecentTransactions transactions={transactions.slice(0, 5)} />
        ) : (
          <div className="rounded-lg border border-bank-gray-light p-6 text-center">
            <p className="text-bank-gray">Aucun mouvement récent</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold">Actions rapides</h2>
        <QuickActions />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AccountsSummary />
        </div>
        <div>
          <NotificationsPanel />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
        <div>
          <SpendingChart data={spendingData} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
