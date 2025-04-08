
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Receipt, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatementService } from '@/services/StatementService';

interface Statement {
  id: string;
  accountId: number;
  period: string;
  date: string;
  status: string;
  fileUrl?: string;
}

interface AccountStatementsTabProps {
  isLoading: boolean;
  statements: Statement[];
}

const AccountStatementsTab: React.FC<AccountStatementsTabProps> = ({ 
  isLoading, 
  statements 
}) => {
  const handleDownloadStatement = async (statementId: string) => {
    try {
      await StatementService.downloadStatement(statementId);
    } catch (error) {
      console.error('Erreur lors du téléchargement du relevé', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relevés de compte</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : statements.length > 0 ? (
          <div className="space-y-4">
            {statements.map((statement) => (
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
  );
};

export default AccountStatementsTab;
