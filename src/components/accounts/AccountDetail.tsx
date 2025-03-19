
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Send, Receipt, TrendingUp, Wallet, ExternalLink } from 'lucide-react';
import { AccountService, Account } from '@/services/AccountService';
import { TransactionService } from '@/services/TransactionService';
import { StatementService } from '@/services/StatementService';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AccountMovements from './AccountMovements';
import AppLayout from '@/components/layout/AppLayout';

const AccountDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Récupérer les détails du compte
  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['account', id],
    queryFn: () => AccountService.getAccountById(Number(id)),
    enabled: !!id,
  });

  // Récupérer les transactions du compte
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['account-transactions', id],
    queryFn: () => TransactionService.getTransactionsByAccountId(Number(id)),
    enabled: !!id,
  });

  // Récupérer les relevés du compte
  const { data: statements, isLoading: isLoadingStatements } = useQuery({
    queryKey: ['account-statements', id],
    queryFn: () => StatementService.getStatements(),
    enabled: !!id,
  });

  // Filtrer les relevés pour ce compte spécifique
  const accountStatements = statements?.filter(s => s.accountId === Number(id)) || [];

  if (isLoadingAccount) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  if (!account) {
    return (
      <AppLayout>
        <div className="flex h-64 flex-col items-center justify-center space-y-4">
          <p className="text-xl font-medium">Compte non trouvé</p>
          <Button onClick={() => navigate('/accounts')}>
            Retour aux comptes
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Calcul de l'évolution du solde sur le dernier mois
  const getBalanceGrowth = (): { percentage: number; amount: number } => {
    if (!account || account.history.length < 2) return { percentage: 0, amount: 0 };
    
    const currentBalance = account.balance;
    const previousBalance = account.history[account.history.length - 2].amount;
    const difference = currentBalance - previousBalance;
    const percentage = previousBalance !== 0 ? (difference / previousBalance) * 100 : 0;
    
    return { 
      percentage, 
      amount: difference 
    };
  };

  const balanceGrowth = getBalanceGrowth();

  // Données de graphique pour les 30 derniers jours (simulé)
  const generateDailyData = () => {
    const data = [];
    const today = new Date();
    const monthHistory = [...account.history].reverse();
    
    // Utiliser les données mensuelles comme référence
    let baseAmount = monthHistory.length > 0 ? monthHistory[0].amount : account.balance;
    
    // Générer des données quotidiennes sur 30 jours
    for (let i = 30; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      
      // Ajouter une variation aléatoire pour simuler les mouvements quotidiens
      const randomFactor = 1 + (Math.random() * 0.02 - 0.01); // ±1%
      
      // Si on est au début d'un nouveau mois, utiliser la donnée mensuelle réelle
      const monthIndex = monthHistory.findIndex(
        h => h.month.toLowerCase() === day.toLocaleString('fr-fr', { month: 'long' }).toLowerCase()
      );
      
      if (monthIndex >= 0 && day.getDate() === 1) {
        baseAmount = monthHistory[monthIndex].amount;
      }
      
      const simulatedAmount = i === 0 ? account.balance : baseAmount * randomFactor;
      baseAmount = simulatedAmount;
      
      data.push({
        date: day.toLocaleDateString('fr-fr'),
        solde: Math.round(simulatedAmount * 100) / 100
      });
    }
    
    return data;
  };

  const dailyData = generateDailyData();

  const handleDownloadStatement = async (statementId: string) => {
    try {
      await StatementService.downloadStatement(statementId);
    } catch (error) {
      console.error('Erreur lors du téléchargement du relevé', error);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/accounts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">{account.name}</h1>
          <p className="text-bank-gray">Détails et historique du compte</p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="statements">Relevés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Évolution du solde</CardTitle>
                <TrendingUp className="h-5 w-5 text-bank-primary" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value.split('/').reverse().join('-'));
                          return date.getDate().toString();
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} ${account.currency}`, 'Solde']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="solde" 
                        stroke="#0F7DEA" 
                        strokeWidth={2}
                        dot={false} 
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Informations</CardTitle>
                <Wallet className="h-5 w-5 text-bank-primary" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-bank-gray">Numéro de compte</p>
                    <p className="font-medium">{account.number}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-bank-gray">Solde actuel</p>
                    <p className="text-2xl font-bold">
                      {account.balance.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} {account.currency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-bank-gray">Évolution mensuelle</p>
                    <div className={`flex items-center ${
                      balanceGrowth.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span className="text-lg font-bold">
                        {balanceGrowth.percentage >= 0 ? '+' : ''}
                        {balanceGrowth.percentage.toFixed(2)}%
                      </span>
                      <span className="ml-2">
                        ({balanceGrowth.amount >= 0 ? '+' : ''}
                        {balanceGrowth.amount.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} {account.currency})
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="mr-2" onClick={() => navigate(`/transfers?fromAccount=${account.id}`)}>
                      <Send className="mr-2 h-4 w-4" />
                      Effectuer un virement
                    </Button>
                    
                    <Button variant="outline" onClick={() => setActiveTab('statements')}>
                      <Receipt className="mr-2 h-4 w-4" />
                      Voir les relevés
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4">
            <AccountMovements
              transactions={transactions || []}
              showFilters={false}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="movements">
          <AccountMovements
            transactions={transactions || []}
            showFilters={true}
          />
        </TabsContent>
        
        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Relevés de compte</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStatements ? (
                <div className="flex justify-center py-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : accountStatements.length > 0 ? (
                <div className="space-y-4">
                  {accountStatements.map((statement) => (
                    <div key={statement.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                          <Receipt className="h-5 w-5 text-bank-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-bank-dark">{statement.period}</p>
                          <p className="text-sm text-bank-gray">
                            {new Date(statement.date).toLocaleDateString('fr-FR')}
                            {statement.status === 'processing' && ' • En traitement'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {statement.status === 'available' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadStatement(statement.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                        )}
                        
                        {statement.fileUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(statement.fileUrl, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Consulter
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-bank-gray">Aucun relevé disponible pour ce compte</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default AccountDetail;
