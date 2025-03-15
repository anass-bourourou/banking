
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountCard from '@/components/accounts/AccountCard';
import RecentTransactions from '@/components/accounts/RecentTransactions';
import CardDisplay from '@/components/accounts/CardDisplay';

const Accounts = () => {
  const accounts = [
    {
      id: 1,
      name: 'Compte Courant',
      number: '5482 7589 1234 5678',
      balance: 4850.75,
      currency: '€',
      history: [
        { month: 'Jan', amount: 4200 },
        { month: 'Fév', amount: 4350 },
        { month: 'Mar', amount: 4100 },
        { month: 'Avr', amount: 4400 },
        { month: 'Mai', amount: 4600 },
        { month: 'Jun', amount: 4500 },
        { month: 'Jul', amount: 4700 },
        { month: 'Aoû', amount: 4850.75 },
      ]
    },
    {
      id: 2,
      name: 'Compte Épargne',
      number: '5482 7589 9876 5432',
      balance: 12350.20,
      currency: '€',
      history: [
        { month: 'Jan', amount: 10500 },
        { month: 'Fév', amount: 10800 },
        { month: 'Mar', amount: 11000 },
        { month: 'Avr', amount: 11200 },
        { month: 'Mai', amount: 11500 },
        { month: 'Jun', amount: 11800 },
        { month: 'Jul', amount: 12100 },
        { month: 'Aoû', amount: 12350.20 },
      ]
    },
    {
      id: 3,
      name: 'Compte Investissement',
      number: '5482 7589 4567 8901',
      balance: 8760.50,
      currency: '€',
      history: [
        { month: 'Jan', amount: 9200 },
        { month: 'Fév', amount: 9100 },
        { month: 'Mar', amount: 8900 },
        { month: 'Avr', amount: 9000 },
        { month: 'Mai', amount: 8800 },
        { month: 'Jun', amount: 8700 },
        { month: 'Jul', amount: 8900 },
        { month: 'Aoû', amount: 8760.50 },
      ]
    }
  ];

  const recentTransactions = [
    { id: 1, description: 'Virement Salaire', amount: 2500.00, type: 'credit' as const, date: '15/09/2023' },
    { id: 2, description: 'Loyer Appartement', amount: 950.00, type: 'debit' as const, date: '12/09/2023' },
    { id: 3, description: 'Courses Supermarché', amount: 128.75, type: 'debit' as const, date: '10/09/2023' },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Mes comptes</h1>
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
