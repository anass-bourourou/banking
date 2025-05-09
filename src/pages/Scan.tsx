
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScanService, ScannedDocument } from '@/services/ScanService';
import { toast } from 'sonner';
import { FileScan, Upload, Clock, Check, X, Loader2, Search, Calendar, History } from 'lucide-react';
import ScanHistory from '@/components/scan/ScanHistory';
import DocumentScanner from '@/components/scan/DocumentScanner';

const Scan = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("scanner");
  
  // Requête pour récupérer l'historique des scans
  const { data: scanHistory, isLoading, error } = useQuery({
    queryKey: ['scan-history'],
    queryFn: () => ScanService.getScanHistory(),
  });
  
  // Mutation pour télécharger un document scanné
  const uploadMutation = useMutation({
    mutationFn: (data: { file: File; title: string; description: string }) => 
      ScanService.uploadScannedDocument(data.file, data.title, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-history'] });
      toast.success('Document scanné avec succès', {
        description: 'Votre document a été téléchargé et est en cours de traitement',
      });
    },
    onError: (error) => {
      toast.error('Erreur lors du scan du document', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  });
  
  // Mutation pour supprimer un document scanné
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ScanService.deleteScannedDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-history'] });
      toast.success('Document supprimé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Scanner de Documents</h1>
        <p className="text-bank-gray">Numérisez et gérez vos documents bancaires</p>
      </div>

      <Tabs defaultValue="scanner" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <FileScan className="h-4 w-4" />
            <span>Scanner un Document</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Historique des Scans</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanner" className="space-y-4">
          <DocumentScanner 
            onScanComplete={(file, title, description) => 
              uploadMutation.mutate({ file, title, description })
            }
            isUploading={uploadMutation.isPending}
          />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <ScanHistory 
            scanHistory={scanHistory || []}
            isLoading={isLoading}
            error={error}
            onDeleteDocument={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Scan;
