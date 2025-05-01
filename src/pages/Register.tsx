
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AuthService } from '@/services/AuthService';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Erreur de validation', {
        description: 'Les mots de passe ne correspondent pas'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const user = await AuthService.register({ name, email, password });
      setUser(user);
      
      toast.success('Compte créé avec succès', {
        description: 'Vous pouvez maintenant vous connecter'
      });
      
      navigate('/login');
    } catch (error) {
      toast.error('Échec de l\'inscription', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du compte'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bank-primary/10 to-white p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-bank-primary">BankWise</h1>
        <p className="text-bank-gray">Votre banque en ligne sécurisée</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Veuillez remplir les informations suivantes pour vous inscrire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Votre nom complet" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Votre adresse email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Choisissez un mot de passe" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirmez votre mot de passe" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-bank-primary text-white hover:bg-bank-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Création en cours..." : "Créer un compte"}
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-bank-gray">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="text-bank-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
