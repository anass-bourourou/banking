
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { Eye, Download, Trash2, Loader2 } from 'lucide-react';

interface DocumentActionsProps {
  documentId: string;
  documentTitle: string;
  onDeleteDocument: (id: string) => void;
  isDeleting: boolean;
  deleteId: string | null;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ 
  documentId, 
  documentTitle, 
  onDeleteDocument, 
  isDeleting, 
  deleteId 
}) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button 
        size="icon"
        variant="outline"
        className="h-8 w-8"
        onClick={() => {
          toast.info(`Affichage de ${documentTitle}`, {
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
          toast.info(`Téléchargement de ${documentTitle}`, {
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
            disabled={isDeleting && deleteId === documentId}
          >
            {isDeleting && deleteId === documentId ? (
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
              Cette action est irréversible. Le document "{documentTitle}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => onDeleteDocument(documentId)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentActions;
