
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, FileX, FileClock, FileImage, Eye, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScanResult } from '@/services/ScanService';

interface ScanHistoryProps {
  scans: ScanResult[];
  isLoading?: boolean;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ scans, isLoading = false }) => {
  const getStatusBadge = (status: ScanResult['status']) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-500">Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="text-amber-500 border-amber-500">En attente</Badge>;
    }
  };
  
  const getStatusIcon = (status: ScanResult['status']) => {
    switch (status) {
      case 'validated':
        return <FileCheck className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <FileX className="h-6 w-6 text-red-500" />;
      case 'pending':
      default:
        return <FileClock className="h-6 w-6 text-amber-500" />;
    }
  };
  
  const formatDateFr = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileImage className="h-5 w-5 text-bank-primary" />
          <span>Historique des scans</span>
        </CardTitle>
        <CardDescription>
          Consultez l'état de vos chèques et documents numérisés
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="loader">Chargement...</div>
          </div>
        ) : scans.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <FileImage className="h-12 w-12 text-bank-gray mb-2" />
            <p className="text-bank-gray">Aucun document scanné pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(scan.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {scan.type === 'cheque' ? 'Chèque' : 'Document'}
                        {scan.reference && ` • ${scan.reference}`}
                      </p>
                      {getStatusBadge(scan.status)}
                    </div>
                    <div className="mt-1 text-sm text-bank-gray">
                      <p>Date: {formatDateFr(scan.date)}</p>
                      {scan.amount && <p className="font-medium">{scan.amount.toLocaleString('fr-FR')} MAD</p>}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" /> Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanHistory;
