import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScannedDocument } from '@/services/ScanService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Eye, Download, Trash2, Search, Clock, Check, X, Loader2, Calendar, History, FileScan } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validé':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
            <Check className="mr-1 h-3 w-3" /> Validé
          </Badge>
        );
      case 'rejeté':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
            <X className="mr-1 h-3 w-3" /> Rejeté
          </Badge>
        );
      case 'en_cours':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
            <Clock className="mr-1 h-3 w-3" /> En cours
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
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
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="mb-4 animate-spin text-bank-primary" />
            <p className="text-bank-gray">Chargement des documents...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
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
                {filteredHistory.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.title}</span>
                        {doc.description && (
                          <span className="text-xs text-bank-gray">{doc.description}</span>
                        )}
                        <span className="text-xs text-bank-gray">
                          {doc.fileName} ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-bank-gray" />
                        <span>
                          {format(new Date(doc.uploadDate), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => {
                            toast.info(`Affichage de ${doc.title}`, {
                              description: "Cette fonctionnalité sera disponible prochainement"
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => {
                            toast.info(`Téléchargement de ${doc.title}`, {
                              description: "Cette fonctionnalité sera disponible prochainement"
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setDeleteId(doc.id)}
                              disabled={isDeleting && deleteId === doc.id}
                            >
                              {isDeleting && deleteId === doc.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Le document "{doc.title}" sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => onDeleteDocument(doc.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
              <FileScan size={24} className="text-bank-gray" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Aucun document trouvé</h3>
            <p className="text-bank-gray">
              {searchTerm 
                ? "Aucun résultat ne correspond à votre recherche" 
                : "Vous n'avez pas encore scanné de documents"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanHistory;
