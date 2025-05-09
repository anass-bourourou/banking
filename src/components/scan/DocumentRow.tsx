
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScannedDocument } from '@/services/ScanService';
import StatusBadge from './StatusBadge';
import DocumentActions from './DocumentActions';

interface DocumentRowProps {
  document: ScannedDocument;
  onDeleteDocument: (id: string) => void;
  isDeleting: boolean;
  deleteId: string | null;
}

const DocumentRow: React.FC<DocumentRowProps> = ({ 
  document, 
  onDeleteDocument, 
  isDeleting, 
  deleteId 
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-medium">{document.title}</span>
          {document.description && (
            <span className="text-xs text-bank-gray">{document.description}</span>
          )}
          <span className="text-xs text-bank-gray">
            {document.fileName} ({(document.fileSize / 1024 / 1024).toFixed(2)} MB)
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-bank-gray" />
          <span>
            {format(new Date(document.uploadDate), 'dd MMMM yyyy', { locale: fr })}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={document.status} />
      </TableCell>
      <TableCell className="text-right">
        <DocumentActions 
          documentId={document.id} 
          documentTitle={document.title} 
          onDeleteDocument={onDeleteDocument}
          isDeleting={isDeleting}
          deleteId={deleteId}
        />
      </TableCell>
    </TableRow>
  );
};

export default DocumentRow;
