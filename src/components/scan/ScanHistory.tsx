
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScannedDocument } from '@/services/ScanService';
import { Search, History } from 'lucide-react';
import DocumentsTable from './DocumentsTable';
import EmptyDocumentState from './EmptyDocumentState';
import LoadingDocuments from './LoadingDocuments';

interface ScanHistoryProps {
  scanHistory: ScannedDocument[];
  isLoading: boolean;
  error: unknown;
  onDeleteDocument: (id: string) => void;
  isDeleting: boolean;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ 
  scanHistory, 
  isLoading, 
  error, 
  onDeleteDocument,
  isDeleting 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredHistory = scanHistory.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDeleteId(id);
    onDeleteDocument(id);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-bank-primary" />
            Historique des Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            <p>Erreur lors du chargement de l'historique des documents.</p>
            <p className="text-sm mt-2">
              {error instanceof Error ? error.message : 'Erreur de connexion au service'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-bank-primary" />
            Historique des Documents
          </CardTitle>
          <CardDescription>
            Consultez tous vos documents numérisés
          </CardDescription>
        </div>
        <div className="relative sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-bank-gray" />
          </div>
          <Input
            type="text"
            placeholder="Rechercher..."
            className="bank-input pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingDocuments />
        ) : filteredHistory.length > 0 ? (
          <DocumentsTable 
            documents={filteredHistory} 
            onDeleteDocument={handleDelete}
            isDeleting={isDeleting}
            deleteId={deleteId}
          />
        ) : (
          <EmptyDocumentState searchTerm={searchTerm} />
        )}
      </CardContent>
    </Card>
  );
};

export default ScanHistory;
