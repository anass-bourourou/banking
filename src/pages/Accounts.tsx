
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountCard from '@/components/accounts/AccountCard';
import RecentTransactions from '@/components/accounts/RecentTransactions';
import CardDisplay from '@/components/accounts/CardDisplay';
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import { TransactionService } from '@/services/TransactionService';
import { Loader2 } from 'lucide-react';

const Accounts = () => {
  // Fetch accounts from the backend
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => AccountService.getAccounts(),
  });

  // Fetch recent transactions from the backend
  const { data: recentTransactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => TransactionService.getRecentTransactions(),
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Mes Comptes</h1>
        <p className="text-bank-gray">Gérez et suivez vos différents comptes</p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-4">
          {isLoadingAccounts ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}

          {isLoadingTransactions ? (
            <div className="flex h-20 w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-bank-primary" />
            </div>
          ) : (
            <RecentTransactions transactions={recentTransactions} />
          )}
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4">
          <CardDisplay />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Accounts;
