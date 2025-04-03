
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Filter, Calendar, Award, Download, Eye, FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AccountService } from '@/services/AccountService';
import { StatementService, BankStatement } from '@/services/StatementService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import StatementsList from '@/components/statements/StatementsList';
import StatementViewer from '@/components/statements/StatementViewer';

// Type pour les documents
interface Document {
  id: string;
  title: string;
  type: 'statement' | 'certificate' | 'receipt';
  date: string;
  fileUrl?: string;
}

const EDocuments = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [viewStatement, setViewStatement] = useState<BankStatement | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetch accounts
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: AccountService.getAccounts,
  });

  // Fetch statements
  const { data: statements = [], isLoading: isLoadingStatements } = useQuery({
    queryKey: ['statements'],
    queryFn: StatementService.getStatements,
  });

  // Documents factices pour la démo
  const certificates = [
    { id: '4', title: 'Attestation de RIB', type: 'certificate' as const, date: '15/01/2023' },
    { id: '5', title: 'Attestation de virement permanent', type: 'certificate' as const, date: '10/02/2023' },
    { id: '6', title: 'Attestation de solde', type: 'certificate' as const, date: '05/03/2023' },
    { id: '7', title: 'Attestation de cautionnement', type: 'certificate' as const, date: '20/01/2023' },
  ];
  
  const receipts = [
    { id: '8', title: 'Reçu paiement vignette', type: 'receipt' as const, date: '20/01/2023' },
    { id: '9', title: 'Reçu paiement facture Eau', type: 'receipt' as const, date: '12/02/2023' },
    { id: '10', title: 'Reçu paiement facture Électricité', type: 'receipt' as const, date: '05/03/2023' },
  ];

  const handleViewStatement = (statement: BankStatement) => {
    setViewStatement(statement);
    setIsViewerOpen(true);
  };

  const handleDownloadStatement = async (statement: BankStatement) => {
    try {
      await StatementService.downloadStatement(statement.id);
      toast.success('Téléchargement démarré', {
        description: `Relevé ${statement.period} pour ${statement.accountName}`
      });
    } catch (error) {
      toast.error('Erreur de téléchargement', {
        description: 'Impossible de télécharger le relevé'
      });
    }
  };

  const handleDownload = async (document: Document) => {
    toast.success('Téléchargement démarré', {
      description: `Le document ${document.title} est en cours de téléchargement`
    });
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    toast.info('Aperçu du document', {
      description: `Visualisation de ${document.title}`
    });
  };

  // Filter statements based on selected account and period
  const filteredStatements = statements.filter(statement => {
    const accountMatch = selectedAccount === 'all' || statement.accountId.toString() === selectedAccount;
    const periodMatch = selectedPeriod === 'all' || statement.period.includes(selectedPeriod);
    return accountMatch && periodMatch;
  });

  const periods = [
    { value: 'all', label: 'Toutes les périodes' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: 'Octobre', label: 'Octobre 2023' },
    { value: 'Septembre', label: 'Septembre 2023' },
    { value: 'Août', label: 'Août 2023' },
  ];

  const renderDocumentsList = (documents: Document[]) => {
    return (
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between rounded-lg border border-bank-gray-light p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                {doc.type === 'statement' && <FileSpreadsheet className="h-5 w-5 text-bank-primary" />}
                {doc.type === 'certificate' && <Award className="h-5 w-5 text-green-600" />}
                {doc.type === 'receipt' && <FileText className="h-5 w-5 text-blue-600" />}
              </div>
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-bank-gray">Date: {doc.date}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => handleView(doc)}
              >
                <Eye className="h-4 w-4" />
                <span>Voir</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => handleDownload(doc)}
              >
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </Button>
            </div>
          </div>
        ))}
        
        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
              <FileText size={24} className="text-bank-gray" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Aucun document disponible</h3>
            <p className="text-bank-gray">
              Vous n'avez pas de documents dans cette catégorie
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">E-Documents</h1>
        <p className="text-bank-gray">Consultez et téléchargez vos documents bancaires</p>
      </div>

      <Tabs defaultValue="statements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statements">Relevés bancaires</TabsTrigger>
          <TabsTrigger value="certificates">Attestations</TabsTrigger>
          <TabsTrigger value="receipts">Reçus de paiement</TabsTrigger>
          <TabsTrigger value="fiscal">Documents fiscaux</TabsTrigger>
        </TabsList>
        
        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-bank-primary" />
                  <div>
                    <CardTitle>Relevés de compte</CardTitle>
                    <CardDescription>Consultez vos relevés mensuels</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
                  <div className="space-y-2 md:w-1/3">
                    <Label htmlFor="account-filter">Compte</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger id="account-filter" className="bank-input">
                        <SelectValue placeholder="Tous les comptes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les comptes</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:w-1/3">
                    <Label htmlFor="period-filter">Période</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger id="period-filter" className="bank-input">
                        <SelectValue placeholder="Toutes les périodes" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 md:w-1/3"
                    onClick={() => {
                      setSelectedAccount('all');
                      setSelectedPeriod('all');
                    }}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Réinitialiser les filtres</span>
                  </Button>
                </div>
              </div>
              
              {isLoadingStatements ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
                </div>
              ) : (
                <StatementsList 
                  statements={filteredStatements} 
                  onView={handleViewStatement}
                  onDownload={handleDownloadStatement}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-bank-primary" />
                <div>
                  <CardTitle>Attestations bancaires</CardTitle>
                  <CardDescription>Consultez et téléchargez vos attestations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderDocumentsList(certificates)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-bank-primary" />
                <div>
                  <CardTitle>Reçus de paiement</CardTitle>
                  <CardDescription>Consultez et téléchargez vos reçus</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderDocumentsList(receipts)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fiscal">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-bank-primary" />
                <div>
                  <CardTitle>Documents fiscaux</CardTitle>
                  <CardDescription>Attestations et documents fiscaux</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                  <FileText size={24} className="text-bank-gray" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Aucun document fiscal disponible</h3>
                <p className="text-bank-gray">
                  Les documents fiscaux pour l'année en cours seront disponibles après la fin de l'année fiscale
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <StatementViewer 
        statement={viewStatement}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        onDownload={handleDownloadStatement}
      />
    </AppLayout>
  );
};

export default EDocuments;
