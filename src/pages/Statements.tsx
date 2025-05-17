
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatementsList from '@/components/statements/StatementsList';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BankStatement } from '@/components/statements/StatementsList';

const Statements = () => {
  // Données statiques pour les relevés
  const demoStatements: BankStatement[] = [
    {
      id: '1',
      accountId: 123456789,
      accountName: 'Compte Courant',
      period: 'Avril 2025',
      date: '2025-05-01',
      fileUrl: '#',
    },
    {
      id: '2',
      accountId: 123456789,
      accountName: 'Compte Courant',
      period: 'Mars 2025',
      date: '2025-04-01',
      fileUrl: '#',
    },
    {
      id: '3',
      accountId: 123456789,
      accountName: 'Compte Courant',
      period: 'Février 2025',
      date: '2025-03-01',
      fileUrl: '#',
    }
  ];

  const handleViewStatement = (statement: BankStatement) => {
    toast.info('Visualisation du relevé', {
      description: `Le relevé #${statement.id} s'ouvre dans un nouvel onglet.`
    });
  };

  const handleDownloadStatement = (statement: BankStatement) => {
    toast.success('Téléchargement démarré', {
      description: `Le relevé #${statement.id} est en cours de téléchargement.`
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Relevés bancaires</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Mes relevés</CardTitle>
            <CardDescription>Consultez et téléchargez vos relevés bancaires</CardDescription>
          </CardHeader>
          <CardContent>
            <StatementsList 
              statements={demoStatements}
              onView={handleViewStatement}
              onDownload={handleDownloadStatement}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Statements;
