
import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface BankStatement {
  id: string;
  accountId: number;
  accountName: string;
  period: string;
  date: string;
  fileUrl?: string;
}

interface StatementsListProps {
  statements: BankStatement[];
  onView: (statement: BankStatement) => void;
  onDownload: (statement: BankStatement) => void;
}

const StatementsList: React.FC<StatementsListProps> = ({
  statements,
  onView,
  onDownload
}) => {
  return (
    <div className="space-y-4">
      {statements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
            <FileText size={24} className="text-bank-gray" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Aucun relevé disponible</h3>
          <p className="text-bank-gray">
            Vous n'avez pas encore de relevés bancaires
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead>Date d'émission</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((statement) => (
                <TableRow key={statement.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-bank-primary" />
                      <span>{statement.period}</span>
                    </div>
                  </TableCell>
                  <TableCell>{statement.accountName}</TableCell>
                  <TableCell>{statement.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-1"
                        onClick={() => onView(statement)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Voir</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-1"
                        onClick={() => onDownload(statement)}
                      >
                        <Download className="h-4 w-4" />
                        <span>Télécharger</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StatementsList;
