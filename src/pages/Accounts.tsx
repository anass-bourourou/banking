
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
      name: 'الحساب الجاري',
      number: '5482 7589 1234 5678',
      balance: 9850.75,
      currency: 'د.م.',
      history: [
        { month: 'يناير', amount: 8200 },
        { month: 'فبراير', amount: 8350 },
        { month: 'مارس', amount: 8100 },
        { month: 'أبريل', amount: 8400 },
        { month: 'ماي', amount: 8600 },
        { month: 'يونيو', amount: 9500 },
        { month: 'يوليوز', amount: 9700 },
        { month: 'غشت', amount: 9850.75 },
      ]
    },
    {
      id: 2,
      name: 'حساب التوفير',
      number: '5482 7589 9876 5432',
      balance: 25350.20,
      currency: 'د.م.',
      history: [
        { month: 'يناير', amount: 19500 },
        { month: 'فبراير', amount: 20800 },
        { month: 'مارس', amount: 21000 },
        { month: 'أبريل', amount: 22200 },
        { month: 'ماي', amount: 23500 },
        { month: 'يونيو', amount: 24800 },
        { month: 'يوليوز', amount: 25100 },
        { month: 'غشت', amount: 25350.20 },
      ]
    },
    {
      id: 3,
      name: 'حساب الاستثمار',
      number: '5482 7589 4567 8901',
      balance: 15760.50,
      currency: 'د.م.',
      history: [
        { month: 'يناير', amount: 16200 },
        { month: 'فبراير', amount: 16100 },
        { month: 'مارس', amount: 15900 },
        { month: 'أبريل', amount: 15500 },
        { month: 'ماي', amount: 15800 },
        { month: 'يونيو', amount: 15700 },
        { month: 'يوليوز', amount: 15900 },
        { month: 'غشت', amount: 15760.50 },
      ]
    }
  ];

  const recentTransactions = [
    { id: 1, description: 'تحويل الراتب', amount: 5500.00, type: 'credit' as const, date: '15/09/2023' },
    { id: 2, description: 'إيجار الشقة', amount: 3200.00, type: 'debit' as const, date: '12/09/2023' },
    { id: 3, description: 'مشتريات مرجان', amount: 728.75, type: 'debit' as const, date: '10/09/2023' },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">حساباتي</h1>
        <p className="text-bank-gray">إدارة ومتابعة حساباتك المختلفة</p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">الحسابات</TabsTrigger>
          <TabsTrigger value="cards">البطاقات</TabsTrigger>
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
