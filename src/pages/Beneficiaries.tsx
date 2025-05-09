
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { BeneficiaryService, Beneficiary } from '@/services/BeneficiaryService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BeneficiaryList from '@/components/beneficiaries/BeneficiaryList';
import AddBeneficiaryForm from '@/components/beneficiaries/AddBeneficiaryForm';

const Beneficiaries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState<Partial<Beneficiary>>({
    name: '',
    rib: '',
    bic: '',
    email: '',
    phone: '',
  });
  
  const queryClient = useQueryClient();

  // Fetch beneficiaries from backend
  const { data: beneficiaries, isLoading, error } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => BeneficiaryService.getBeneficiaries(),
  });

  // Add beneficiary mutation
  const addBeneficiaryMutation = useMutation({
    mutationFn: (beneficiaryData: Omit<Beneficiary, 'id' | 'favorite'>) => 
      BeneficiaryService.addBeneficiary(beneficiaryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error adding beneficiary:', error);
      toast.error('Erreur lors de l\'ajout du bénéficiaire', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  });

  // Delete beneficiary mutation
  const deleteBeneficiaryMutation = useMutation({
    mutationFn: (id: string) => BeneficiaryService.deleteBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
    onError: (error) => {
      console.error('Error deleting beneficiary:', error);
      toast.error('Erreur lors de la suppression du bénéficiaire', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  });

  const resetForm = () => {
    setNewBeneficiary({
      name: '',
      rib: '',
      bic: '',
      email: '',
      phone: '',
    });
    setShowAddForm(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBeneficiary(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBeneficiary = () => {
    if (!newBeneficiary.name || !newBeneficiary.rib || !newBeneficiary.bic) {
      toast.error('Informations incomplètes', {
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }
    
    addBeneficiaryMutation.mutate(newBeneficiary as Omit<Beneficiary, 'id' | 'favorite'>);
  };

  const handleDeleteBeneficiary = (id: string, name: string) => {
    // Show confirmation toast
    toast(
      <div className="flex flex-col">
        <span className="font-medium">Confirmer la suppression</span>
        <span>Voulez-vous vraiment supprimer {name}?</span>
      </div>,
      {
        action: {
          label: "Supprimer",
          onClick: () => deleteBeneficiaryMutation.mutate(id),
        },
        cancel: {
          label: "Annuler",
          onClick: () => {}, // Empty onClick handler for the cancel button
        },
        duration: 5000,
      }
    );
  };

  if (error) {
    return (
      <AppLayout>
        <div className="mb-6">
          <h1 className="text-xl font-semibold md:text-2xl">Bénéficiaires</h1>
          <p className="text-bank-gray">Gérez vos bénéficiaires pour effectuer des virements facilement</p>
        </div>
        
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          <p>Impossible de charger les bénéficiaires. Veuillez réessayer plus tard.</p>
          <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Erreur de connexion'}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Bénéficiaires</h1>
        <p className="text-bank-gray">Gérez vos bénéficiaires pour effectuer des virements facilement</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Mes bénéficiaires</CardTitle>
            <CardDescription>Liste de tous vos bénéficiaires enregistrés</CardDescription>
          </div>
          <div className="flex space-x-2">
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
            <button 
              onClick={() => setShowAddForm(true)} 
              className="bank-button flex items-center space-x-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <AddBeneficiaryForm 
              newBeneficiary={newBeneficiary}
              onInputChange={handleInputChange}
              onAddBeneficiary={handleAddBeneficiary}
              onCancel={() => setShowAddForm(false)}
              isAdding={addBeneficiaryMutation.isPending}
            />
          )}

          <BeneficiaryList 
            beneficiaries={beneficiaries || []}
            searchTerm={searchTerm}
            isLoading={isLoading}
            onDelete={handleDeleteBeneficiary}
            onAddClick={() => setShowAddForm(true)}
            deletingId={deleteBeneficiaryMutation.variables}
            isDeletingBeneficiary={deleteBeneficiaryMutation.isPending}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Beneficiaries;
