import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileSpreadsheet, Award, Download, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { EDocumentService, EDocument } from '@/services/EDocumentService';

const EDocuments: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<EDocument | null>(null);

  // Fetch different document types
  const { 
    data: statements = [], 
    isLoading: statementsLoading 
  } = useQuery({
    queryKey: ['documents', 'statement'],
    queryFn: () => EDocumentService.getDocumentsByType('statement'),
  });
  
  const { 
    data: certificates = [], 
    isLoading: certificatesLoading 
  } = useQuery({
    queryKey: ['documents', 'certificate'],
    queryFn: () => EDocumentService.getDocumentsByType('certificate'),
  });
  
  const { 
    data: attestations = [], 
    isLoading: attestationsLoading 
  } = useQuery({
    queryKey: ['documents', 'attestation'],
    queryFn: () => EDocumentService.getDocumentsByType('attestation'),
  });
  
  // Download document mutation
  const downloadMutation = useMutation({
    mutationFn: EDocumentService.downloadDocument,
    onSuccess: () => {
      toast.success('Téléchargement démarré', {
        description: 'Le document est en cours de téléchargement'
      });
    },
    onError: (error) => {
      toast.error('Erreur de téléchargement', {
        description: 'Impossible de télécharger le document'
      });
    }
  });

  const handleDownload = (document: EDocument) => {
    downloadMutation.mutate(document.id);
  };

  const handleView = (document: EDocument) => {
    setSelectedDocument(document);
    // Dans un cas réel, on ouvrirait une modal pour afficher le document
    toast.info('Aperçu du document', {
      description: `Visualisation de ${document.title} en cours de développement`
    });
  };

  // Document list component to avoid repetition
  const DocumentList = ({ documents, isLoading }: { documents: EDocument[], isLoading: boolean }) => (
    isLoading ? (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-bank-primary" />
      </div>
    ) : documents.length > 0 ? (
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-bank-gray">{doc.date}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleView(doc)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDownload(doc)}
                disabled={downloadMutation.isPending && downloadMutation.variables === doc.id}
              >
                {downloadMutation.isPending && downloadMutation.variables === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="py-10 text-center">
        <p className="text-bank-gray">Aucun document disponible</p>
      </div>
    )
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-bank-primary" />
          <span>Documents électroniques</span>
        </CardTitle>
        <CardDescription>
          Consultez et téléchargez vos documents bancaires
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="statements">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statements">Relevés</TabsTrigger>
            <TabsTrigger value="certificates">Certificats</TabsTrigger>
            <TabsTrigger value="attestations">Attestations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="statements" className="mt-4">
            <DocumentList documents={statements} isLoading={statementsLoading} />
          </TabsContent>
          
          <TabsContent value="certificates" className="mt-4">
            <DocumentList documents={certificates} isLoading={certificatesLoading} />
          </TabsContent>
          
          <TabsContent value="attestations" className="mt-4">
            <DocumentList documents={attestations} isLoading={attestationsLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EDocuments;
