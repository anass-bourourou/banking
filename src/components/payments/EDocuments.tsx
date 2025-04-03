
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileSpreadsheet, Award, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { StatementService } from '@/services/StatementService';

interface Document {
  id: string;
  title: string;
  type: 'statement' | 'certificate' | 'receipt';
  date: string;
  fileUrl?: string;
}

const EDocuments: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Documents factices pour la démo
  const statements = [
    { id: '1', title: 'Relevé bancaire - Janvier 2023', type: 'statement' as const, date: '01/02/2023' },
    { id: '2', title: 'Relevé bancaire - Février 2023', type: 'statement' as const, date: '01/03/2023' },
    { id: '3', title: 'Relevé bancaire - Mars 2023', type: 'statement' as const, date: '01/04/2023' },
  ];
  
  const certificates = [
    { id: '4', title: 'Attestation de RIB', type: 'certificate' as const, date: '15/01/2023' },
    { id: '5', title: 'Attestation de virement permanent', type: 'certificate' as const, date: '10/02/2023' },
    { id: '6', title: 'Attestation de solde', type: 'certificate' as const, date: '05/03/2023' },
  ];
  
  const receipts = [
    { id: '7', title: 'Reçu paiement vignette', type: 'receipt' as const, date: '20/01/2023' },
    { id: '8', title: 'Reçu paiement facture Eau', type: 'receipt' as const, date: '12/02/2023' },
    { id: '9', title: 'Reçu paiement facture Électricité', type: 'receipt' as const, date: '05/03/2023' },
  ];

  const handleDownload = async (document: Document) => {
    setIsLoading(true);
    
    try {
      // Pour les relevés bancaires, utiliser le service existant
      if (document.type === 'statement') {
        await StatementService.downloadStatement(document.id);
      } else {
        // Pour les autres types de documents, simuler un téléchargement
        setTimeout(() => {
          toast.success('Téléchargement démarré', {
            description: `Le document ${document.title} est en cours de téléchargement`
          });
        }, 1000);
      }
    } catch (error) {
      toast.error('Erreur de téléchargement', {
        description: 'Impossible de télécharger le document'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    // Dans un cas réel, on ouvrirait une modal pour afficher le document
    toast.info('Aperçu du document', {
      description: `Visualisation de ${document.title}`
    });
  };

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
                disabled={isLoading}
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
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-bank-primary" />
          <div>
            <CardTitle>E-Documents</CardTitle>
            <CardDescription>Consultez et téléchargez vos documents électroniques</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="statements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="statements">Relevés bancaires</TabsTrigger>
            <TabsTrigger value="certificates">Attestations</TabsTrigger>
            <TabsTrigger value="receipts">Reçus de paiement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="statements">
            {renderDocumentsList(statements)}
          </TabsContent>
          
          <TabsContent value="certificates">
            {renderDocumentsList(certificates)}
          </TabsContent>
          
          <TabsContent value="receipts">
            {renderDocumentsList(receipts)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EDocuments;
