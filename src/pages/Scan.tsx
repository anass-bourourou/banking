
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { ScanService } from '@/services/ScanService';
import DocumentScanner from '@/components/scan/DocumentScanner';
import ScanHistory from '@/components/scan/ScanHistory';

const Scan = () => {
  // Fetch scan history
  const { 
    data: scanHistory = [],
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery({
    queryKey: ['scanHistory'],
    queryFn: () => {
      // For demonstration, use mock data
      // In a real app, this would be: ScanService.getScanHistory()
      return Promise.resolve(ScanService.getMockScanHistory());
    }
  });

  // Handle any error in loading scan history
  React.useEffect(() => {
    if (historyError) {
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger l\'historique des scans'
      });
    }
  }, [historyError]);

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Scan de documents</h1>
          <p className="text-bank-gray">Scannez vos chèques et documents pour traitement</p>
        </div>
        
        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              <span>Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              <span>Historique</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner">
            <DocumentScanner />
          </TabsContent>
          
          <TabsContent value="history">
            <ScanHistory 
              scans={scanHistory} 
              isLoading={isLoadingHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Scan;
