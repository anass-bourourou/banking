
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { BankLogo } from '@/components/auth/BankLogo';

const Login = () => {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const user = await AuthService.login({ username, password });
      
      setUser(user);
      
      toast.success('Connexion réussie', {
        description: `Bienvenue ${user.name || 'dans votre espace bancaire'}`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Identifiants incorrects, veuillez réessayer';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast.error('Échec de la connexion', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bank-primary/10 to-white p-4">
      <BankLogo />
      
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 shadow-md">
          <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
          <div className="rounded-md bg-blue-50 p-3 text-sm">
            <p className="font-medium">Compte démo</p>
            <p>Utilisateur: <strong>demo</strong></p>
            <p>Mot de passe: <strong>demo123</strong></p>
          </div>
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
                      description: "Utilisez les identifiants de démo fournis.",
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
            
            <div className="text-center mt-4">
              <p className="text-sm text-bank-gray">
                Vous n'avez pas de compte ?{' '}
                <Link to="/create-account" className="text-bank-primary hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
