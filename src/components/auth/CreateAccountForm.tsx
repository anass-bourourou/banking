
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Mail, User, Home, IdCard, Phone } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  cin: z.string().min(6, "Le CIN doit contenir au moins 6 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export const CreateAccountForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      cin: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await AuthService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        address: values.address,
        cin: values.cin,
        phone: values.phone,
      });
      
      toast.success('Compte créé avec succès', {
        description: 'Vous pouvez maintenant vous connecter'
      });
      
      navigate('/login');
    } catch (error) {
      toast.error('Échec de la création du compte', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du compte'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="exemple@email.com" 
                    {...field} 
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de téléphone</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="tel" 
                    placeholder="+212 6XX XXX XXX" 
                    {...field} 
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="123 Rue Example, Ville" 
                    {...field} 
                    className="pl-10"
                  />
                  <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CIN (Carte d'Identité Nationale)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="AB123456" 
                    {...field} 
                    className="pl-10"
                  />
                  <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="********" 
                    {...field} 
                    className="pl-10 pr-10"
                  />
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="********" 
                    {...field} 
                    className="pl-10 pr-10"
                  />
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
    </Form>
  );
};
