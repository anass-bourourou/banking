
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { ComplaintService, ComplaintFormData } from '@/services/ComplaintService';
import { AlertCircle } from 'lucide-react';

const ComplaintForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error('Formulaire incomplet', {
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const complaintData: ComplaintFormData = {
        title,
        description,
        category: category || undefined,
        reference_id: referenceId || undefined
      };
      
      await ComplaintService.createComplaint(complaintData);
      
      // Réinitialiser le formulaire
      setTitle('');
      setCategory('');
      setDescription('');
      setReferenceId('');
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <CardTitle>Déposer une réclamation</CardTitle>
            <CardDescription>
              Signalez un problème ou une préoccupation concernant votre compte
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Objet de la réclamation *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Problème de virement"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virement">Virement</SelectItem>
                <SelectItem value="carte">Carte bancaire</SelectItem>
                <SelectItem value="compte">Compte</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reference">Référence (optionnel)</Label>
            <Input
              id="reference"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="Ex: Numéro de transaction"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre problème en détail..."
              rows={5}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre la réclamation'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-bank-gray">
        * Champs obligatoires
      </CardFooter>
    </Card>
  );
};

export default ComplaintForm;
