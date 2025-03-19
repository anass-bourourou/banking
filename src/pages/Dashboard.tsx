
import React from 'react';
import { Card } from '@/components/ui/card';
import BalanceCard from '@/components/dashboard/BalanceCard';
import AccountsSummary from '@/components/dashboard/AccountsSummary';
import SpendingChart from '@/components/dashboard/SpendingChart';
import QuickActions from '@/components/dashboard/QuickActions';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import { Separator } from '@/components/ui/separator';

const Dashboard: React.FC = () => {
  // Sample spending data for the chart
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
          <BalanceCard 
            accountType="Compte Principal"
            accountNumber="123456789012"
            balance={24350.00}
            currency="MAD"
            change={{
              amount: 530.25,
              percentage: 2.3,
              increase: true
            }}
          />
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Compte courant</span>
                <span className="font-semibold">24,350.00 MAD</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Compte épargne</span>
                <span className="font-semibold">135,720.50 MAD</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Compte devise</span>
                <span className="font-semibold">5,230.00 USD</span>
              </div>
            </div>
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
