import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Search, Send, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic: string;
  email?: string;
  phone?: string;
}

const Beneficiaries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState<Partial<Beneficiary>>({
    name: '',
    iban: '',
    bic: '',
    email: '',
    phone: '',
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: '1',
      name: 'Marie Durand',
      iban: 'FR76 3000 4000 1200 0000 9876 543',
      bic: 'BNPAFRPP',
      email: 'marie.durand@email.com',
      phone: '06 12 34 56 78',
    },
    {
      id: '2',
      name: 'Pierre Martin',
      iban: 'FR76 1234 5678 9101 1121 3141 516',
      bic: 'AGRIFRPP',
      email: 'pierre.martin@email.com',
    },
    {
      id: '3',
      name: 'Sophie Leroy',
      iban: 'FR76 9876 5432 1098 7654 3210 123',
      bic: 'SOGEFRPP',
      phone: '07 65 43 21 09',
    },
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBeneficiary(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBeneficiary = () => {
    if (!newBeneficiary.name || !newBeneficiary.iban || !newBeneficiary.bic) {
      toast.error('Informations incomplètes', {
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    const newId = (beneficiaries.length + 1).toString();
    const beneficiary = { ...newBeneficiary, id: newId } as Beneficiary;
    
    setBeneficiaries(prev => [...prev, beneficiary]);
    setNewBeneficiary({
      name: '',
      iban: '',
      bic: '',
      email: '',
      phone: '',
    });
    setShowAddForm(false);
    
    toast.success('Bénéficiaire ajouté', {
      description: `${beneficiary.name} a été ajouté à vos bénéficiaires`,
    });
  };

  const handleDeleteBeneficiary = (id: string) => {
    const beneficiary = beneficiaries.find(b => b.id === id);
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
    
    toast.success('Bénéficiaire supprimé', {
      description: `${beneficiary?.name} a été supprimé de vos bénéficiaires`,
    });
  };

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.iban.toLowerCase().replace(/\s/g, '').includes(searchTerm.toLowerCase().replace(/\s/g, ''))
  );

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
            <div className="mb-6 rounded-xl border border-bank-gray-light p-4">
              <h3 className="mb-4 text-lg font-medium">Ajouter un bénéficiaire</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    className="bank-input"
                    placeholder="Ex: Marie Durand"
                    value={newBeneficiary.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN *</Label>
                  <Input
                    id="iban"
                    name="iban"
                    className="bank-input"
                    placeholder="Ex: FR76 1234 5678 9101 1121 3141 516"
                    value={newBeneficiary.iban}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bic">BIC/SWIFT *</Label>
                  <Input
                    id="bic"
                    name="bic"
                    className="bank-input"
                    placeholder="Ex: BNPAFRPP"
                    value={newBeneficiary.bic}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="bank-input"
                    placeholder="Ex: marie.durand@email.com"
                    value={newBeneficiary.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    className="bank-input"
                    placeholder="Ex: 06 12 34 56 78"
                    value={newBeneficiary.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="bank-button-secondary"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddBeneficiary} 
                  className="bank-button"
                >
                  Ajouter le bénéficiaire
                </button>
              </div>
            </div>
          )}

          {filteredBeneficiaries.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBeneficiaries.map((beneficiary) => (
                <div 
                  key={beneficiary.id} 
                  className="rounded-xl border border-bank-gray-light p-4 transition-all duration-300 hover:shadow-card-hover"
                >
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                      <User className="h-5 w-5 text-bank-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{beneficiary.name}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-bank-gray">IBAN: </span>
                      <span className="font-medium">{beneficiary.iban}</span>
                    </div>
                    <div>
                      <span className="text-bank-gray">BIC: </span>
                      <span className="font-medium">{beneficiary.bic}</span>
                    </div>
                    {beneficiary.email && (
                      <div>
                        <span className="text-bank-gray">Email: </span>
                        <span className="font-medium">{beneficiary.email}</span>
                      </div>
                    )}
                    {beneficiary.phone && (
                      <div>
                        <span className="text-bank-gray">Téléphone: </span>
                        <span className="font-medium">{beneficiary.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button className="rounded-full bg-bank-gray-light p-2 text-bank-dark hover:bg-bank-gray">
                      <Edit2 size={16} />
                    </button>
                    <button className="rounded-full bg-bank-primary p-2 text-white hover:bg-bank-primary/90">
                      <Send size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBeneficiary(beneficiary.id)} 
                      className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bank-gray-light">
                <User size={24} className="text-bank-gray" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Aucun bénéficiaire trouvé</h3>
              <p className="text-bank-gray">
                {searchTerm 
                  ? "Aucun résultat ne correspond à votre recherche" 
                  : "Vous n'avez pas encore ajouté de bénéficiaires"}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="bank-button mt-4"
                >
                  Ajouter un bénéficiaire
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Beneficiaries;
