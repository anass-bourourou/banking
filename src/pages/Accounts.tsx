
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, ArrowUpRight, CreditCard, PlusCircle } from 'lucide-react';

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
    { id: 1, description: 'Virement Salaire', amount: 2500.00, type: 'credit', date: '15/09/2023' },
    { id: 2, description: 'Loyer Appartement', amount: 950.00, type: 'debit', date: '12/09/2023' },
    { id: 3, description: 'Courses Supermarché', amount: 128.75, type: 'debit', date: '10/09/2023' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg">
          <p className="text-sm font-medium text-bank-gray">{label}</p>
          <p className="text-bank-primary font-medium">
            {payload[0].value.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} €
          </p>
        </div>
      );
    }
    return null;
  };

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
              <Card key={account.id} className="transition-all duration-300 hover:shadow-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{account.name}</CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                    <CreditCard className="h-5 w-5 text-bank-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-bank-gray">**** {account.number.slice(-4)}</div>
                  <div className="mt-2 text-2xl font-bold">
                    {account.balance.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} {account.currency}
                  </div>
                  
                  <div className="mt-4 h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={account.history} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`gradient-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F7DEA" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0F7DEA" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#0F7DEA" 
                          strokeWidth={2}
                          dot={false} 
                          activeDot={{ r: 6 }}
                        />
                        <XAxis dataKey="month" hide />
                        <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                        <Tooltip content={<CustomTooltip />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <button className="bank-button-secondary flex items-center px-3 py-2 text-sm">
                      <span>Détails</span>
                    </button>
                    <button className="bank-button flex items-center px-3 py-2 text-sm">
                      <span>Transférer</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transactions récentes</CardTitle>
              <CardDescription>Aperçu des dernières transactions sur vos comptes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
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
                      {transaction.amount.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} €
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="transition-all duration-300 hover:shadow-card-hover">
              <div className="relative h-48 overflow-hidden rounded-t-xl bg-gradient-to-r from-bank-primary to-blue-500 p-6 text-white">
                <div className="absolute top-4 right-4 text-lg font-light">BankWise</div>
                <div className="mt-6 text-lg">Visa Premium</div>
                <div className="mt-1 text-lg font-light">**** **** **** 7890</div>
                <div className="absolute bottom-6 left-6">
                  <div className="text-sm font-light">Valable jusqu'à</div>
                  <div>12/25</div>
                </div>
                <div className="absolute bottom-6 right-6">
                  <div className="font-medium">JEAN DUPONT</div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Carte Visa Premium</h3>
                    <p className="text-sm text-bank-gray">Liée au compte courant</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bank-button-secondary flex items-center px-3 py-2 text-sm">
                      <span>Paramètres</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex h-full items-center justify-center p-6 transition-all duration-300 hover:shadow-card-hover">
              <button className="flex flex-col items-center justify-center space-y-3 text-bank-gray">
                <PlusCircle size={48} className="text-bank-primary" />
                <span className="font-medium">Ajouter une nouvelle carte</span>
              </button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Accounts;
