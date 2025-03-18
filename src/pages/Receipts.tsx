
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { ReceiptService, Receipt } from '@/services/ReceiptService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download, Eye, Filter, Receipt as ReceiptIcon, CreditCard, Tag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ReceiptViewer from '@/components/receipts/ReceiptViewer';

const Receipts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewReceipt, setViewReceipt] = useState<Receipt | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Fetch receipts
  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: ReceiptService.getReceipts,
  });

  const handleDownload = async (receipt: Receipt) => {
    try {
      await ReceiptService.downloadReceipt(receipt.id);
      toast.success('Téléchargement démarré', {
        description: `Reçu: ${receipt.title}`
      });
    } catch (error) {
      toast.error('Erreur de téléchargement', {
        description: 'Impossible de télécharger le reçu'
      });
    }
  };

  const handleView = (receipt: Receipt) => {
    setViewReceipt(receipt);
    setIsViewerOpen(true);
  };

  // Filter receipts based on search term, type, and status
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          receipt.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          receipt.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || receipt.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'bill', label: 'Factures' },
    { value: 'subscription', label: 'Abonnements' },
    { value: 'tax', label: 'Taxes et impôts' },
    { value: 'other', label: 'Autres' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'paid', label: 'Payé' },
    { value: 'pending', label: 'En attente' },
    { value: 'overdue', label: 'En retard' },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bill':
        return <ReceiptIcon className="h-4 w-4" />;
      case 'subscription':
        return <CreditCard className="h-4 w-4" />;
      case 'tax':
        return <Tag className="h-4 w-4" />;
      default:
        return <ReceiptIcon className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Reçus et Factures</h1>
        <p className="text-bank-gray">Gérez vos reçus de paiement et vos factures</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ReceiptIcon className="h-5 w-5 text-bank-primary" />
              <div>
                <CardTitle>Mes Reçus</CardTitle>
                <CardDescription>Tous vos reçus et factures en un seul endroit</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
              <div className="md:w-1/3">
                <Label htmlFor="search" className="mb-2">Recherche</Label>
                <div className="relative">
                  <Input 
                    id="search"
                    type="text"
                    placeholder="Rechercher par titre, référence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bank-input pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-bank-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/4">
                <Label htmlFor="type-filter" className="mb-2">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter" className="bank-input">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:w-1/4">
                <Label htmlFor="status-filter" className="mb-2">Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="bank-input">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:w-1/6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bank-primary"></div>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                <ReceiptIcon size={24} className="text-bank-gray" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Aucun reçu trouvé</h3>
              <p className="text-bank-gray">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? "Aucun résultat ne correspond à vos critères de recherche" 
                  : "Vous n'avez pas encore de reçus"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Émetteur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(receipt.type)}
                          <span>{receipt.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell>{receipt.reference}</TableCell>
                      <TableCell>{receipt.merchant}</TableCell>
                      <TableCell className="font-medium">{receipt.amount.toLocaleString('fr-MA')} MAD</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(receipt.status)}`}>
                          {getStatusLabel(receipt.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleView(receipt)}
                            className="text-bank-gray hover:text-bank-dark"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownload(receipt)}
                            className="text-bank-primary hover:text-bank-primary-dark"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ReceiptViewer 
        receipt={viewReceipt}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        onDownload={handleDownload}
      />
    </AppLayout>
  );
};

export default Receipts;
