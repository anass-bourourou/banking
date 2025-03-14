
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import SpendingChart from '@/components/dashboard/SpendingChart';
import QuickActions from '@/components/dashboard/QuickActions';

const Index = () => {
  const spendingData = [
    { name: 'Logement', value: 950, color: '#0F7DEA' },
    { name: 'Alimentation', value: 380, color: '#10B981' },
    { name: 'Transport', value: 210, color: '#F59E0B' },
    { name: 'Loisirs', value: 320, color: '#8B5CF6' },
    { name: 'Santé', value: 150, color: '#EC4899' },
    { name: 'Autres', value: 290, color: '#6B7280' },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Bonjour, Jean</h1>
        <p className="text-bank-gray">Bienvenue dans votre espace bancaire</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <BalanceCard
          accountType="Compte Courant"
          accountNumber="5482 7589 1234 5678"
          balance={4850.75}
          change={{
            amount: 250.0,
            percentage: 5.4,
            increase: true,
          }}
        />
        <BalanceCard
          accountType="Compte Épargne"
          accountNumber="5482 7589 9876 5432"
          balance={12350.20}
          change={{
            amount: 350.0,
            percentage: 2.9,
            increase: true,
          }}
        />
        <BalanceCard
          accountType="Compte Investissement"
          accountNumber="5482 7589 4567 8901"
          balance={8760.50}
          change={{
            amount: 120.0,
            percentage: 1.4,
            increase: false,
          }}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold">Actions rapides</h2>
        <QuickActions />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TransactionHistory />
        <SpendingChart data={spendingData} />
      </div>
    </AppLayout>
  );
};

export default Index;
