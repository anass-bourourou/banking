
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StatementsList from '@/components/statements/StatementsList';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Statements = () => {
  // Données statiques pour les relevés
  const demoStatements = [
    {
      id: '1',
      accountId: '123456789',
      period: 'Avril 2025',
      date: '2025-05-01',
      fileSize: '1.2 MB',
      downloadUrl: '#'
    },
    {
      id: '2',
      accountId: '123456789',
      period: 'Mars 2025',
      date: '2025-04-01',
      fileSize: '1.1 MB',
      downloadUrl: '#'
    },
    {
      id: '3',
      accountId: '123456789',
      period: 'Février 2025',
      date: '2025-03-01',
      fileSize: '980 KB',
      downloadUrl: '#'
    }
  ];

  const handleViewStatement = (statementId: string) => {
    toast.info('Visualisation du relevé', {
      description: `Le relevé #${statementId} s'ouvre dans un nouvel onglet.`
    });
  };

  const handleDownloadStatement = (statementId: string) => {
    toast.success('Téléchargement démarré', {
      description: `Le relevé #${statementId} est en cours de téléchargement.`
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
