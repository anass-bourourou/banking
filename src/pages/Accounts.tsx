import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountCard from '@/components/accounts/AccountCard';
import RecentTransactions from '@/components/accounts/RecentTransactions';
import CardDisplay from '@/components/accounts/CardDisplay';
import { Transaction } from '@/types/transaction';

const Accounts = () => {
  const accounts = [
    {
      id: 1,
      name: 'Compte Courant',
      number: '5482 7589 1234 5678',
      balance: 9850.75,
      currency: 'MAD',
      history: [
        { month: 'Janvier', amount: 8200 },
        { month: 'Février', amount: 8350 },
        { month: 'Mars', amount: 8100 },
        { month: 'Avril', amount: 8400 },
        { month: 'Mai', amount: 8600 },
        { month: 'Juin', amount: 9500 },
        { month: 'Juillet', amount: 9700 },
        { month: 'Août', amount: 9850.75 },
      ]
    },
    {
      id: 2,
      name: 'Compte Épargne',
      number: '5482 7589 9876 5432',
      balance: 25350.20,
      currency: 'MAD',
      history: [
        { month: 'Janvier', amount: 19500 },
        { month: 'Février', amount: 20800 },
        { month: 'Mars', amount: 21000 },
        { month: 'Avril', amount: 22200 },
        { month: 'Mai', amount: 23500 },
        { month: 'Juin', amount: 24800 },
        { month: 'Juillet', amount: 25100 },
        { month: 'Août', amount: 25350.20 },
      ]
    },
    {
      id: 3,
      name: 'Compte Investissement',
      number: '5482 7589 4567 8901',
      balance: 15760.50,
      currency: 'MAD',
      history: [
        { month: 'Janvier', amount: 16200 },
        { month: 'Février', amount: 16100 },
        { month: 'Mars', amount: 15900 },
        { month: 'Avril', amount: 15500 },
        { month: 'Mai', amount: 15800 },
        { month: 'Juin', amount: 15700 },
        { month: 'Juillet', amount: 15900 },
        { month: 'Août', amount: 15760.50 },
      ]
    }
  ];

  const recentTransactions: Transaction[] = [
    { id: 1, description: 'Salaire Attijariwafa Bank', amount: 8500.00, type: 'credit' as const, date: '15/09/2023', status: 'completed' },
    { id: 2, description: 'Loyer Appartement', amount: 3800.00, type: 'debit' as const, date: '12/09/2023', status: 'completed' },
    { id: 3, description: 'Marjane Casablanca', amount: 720.75, type: 'debit' as const, date: '10/09/2023', status: 'completed' },
  ];

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>

          <RecentTransactions transactions={recentTransactions} />
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4">
          <CardDisplay />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Accounts;
