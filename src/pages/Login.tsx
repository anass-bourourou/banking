
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For demo purposes, we'll use a mock login
    // In a real app, this would connect to a backend API
    setTimeout(() => {
      // Mock successful login with demo credentials
      if (username === 'demo' && password === 'password') {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          name: 'Jean Dupont',
          email: 'jean.dupont@example.com'
        }));
        
        toast.success('Connexion réussie', {
          description: 'Bienvenue dans votre espace bancaire'
        });
        
        navigate('/');
      } else {
        toast.error('Échec de la connexion', {
          description: 'Identifiants incorrects, veuillez réessayer'
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bank-primary/10 to-white p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-bank-primary">BankWise</h1>
        <p className="text-bank-gray">Votre banque en ligne sécurisée</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Votre identifiant" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <a 
                  href="#" 
                  className="text-sm text-bank-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Réinitialisation du mot de passe", {
                      description: "Un email a été envoyé avec les instructions"
                    });
                  }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Votre mot de passe" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-bank-primary text-white hover:bg-bank-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
            
            <div className="mt-4 text-center text-sm text-bank-gray">
              <p>Pour la démonstration, utilisez :</p>
              <p>Identifiant: <span className="font-medium">demo</span></p>
              <p>Mot de passe: <span className="font-medium">password</span></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
