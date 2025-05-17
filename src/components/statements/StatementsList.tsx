
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

export interface BankStatement {
  id: string;
  accountId: number;
  accountName: string;
  period: string;
  date: string;
  fileUrl: string;
}

interface StatementsListProps {
  statements: BankStatement[];
  onView: (statement: BankStatement) => void;
  onDownload: (statement: BankStatement) => void;
}

const StatementsList: React.FC<StatementsListProps> = ({ statements, onView, onDownload }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Période</TableHead>
            <TableHead>Compte</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Aucun relevé disponible
              </TableCell>
            </TableRow>
          ) : (
            statements.map((statement) => (
              <TableRow key={statement.id}>
                <TableCell className="font-medium">{statement.period}</TableCell>
                <TableCell>{statement.accountName}</TableCell>
                <TableCell>{formatDate(statement.date)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onView(statement)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Consulter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDownload(statement)}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StatementsList;
