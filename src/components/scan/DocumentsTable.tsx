
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { ScannedDocument } from '@/services/ScanService';
import DocumentRow from './DocumentRow';

interface DocumentsTableProps {
  documents: ScannedDocument[];
  onDeleteDocument: (id: string) => void;
  isDeleting: boolean;
  deleteId: string | null;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({ 
  documents, 
  onDeleteDocument, 
  isDeleting, 
  deleteId 
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <DocumentRow 
              key={doc.id} 
              document={doc} 
              onDeleteDocument={onDeleteDocument}
              isDeleting={isDeleting}
              deleteId={deleteId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTable;
