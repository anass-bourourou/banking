
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from 'lucide-react';
import { AccountService } from '@/services/AccountService';
import { TransactionService } from '@/services/TransactionService';
import { StatementService } from '@/services/StatementService';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import AccountOverviewTab from './AccountOverviewTab';
import AccountMovements from './AccountMovements';
import AccountStatementsTab from './AccountStatementsTab';

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
          <AccountOverviewTab 
            account={account} 
            transactions={transactions || []} 
            setActiveTab={setActiveTab}
          />
        </TabsContent>
        
        <TabsContent value="movements">
          <AccountMovements
            transactions={transactions || []}
            showFilters={true}
          />
        </TabsContent>
        
        <TabsContent value="statements">
          <AccountStatementsTab
            isLoading={isLoadingStatements}
            statements={accountStatements}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default AccountDetail;
