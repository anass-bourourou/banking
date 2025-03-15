
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { User, Lock, Bell, Shield, CreditCard, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profil mis à jour', {
      description: 'Vos informations personnelles ont été mises à jour avec succès',
    });
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Formulaire incomplet', {
        description: 'Veuillez remplir tous les champs',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Erreur de mot de passe', {
        description: 'Les nouveaux mots de passe ne correspondent pas',
      });
      return;
    }
    
    toast.success('Mot de passe modifié', {
      description: 'Votre mot de passe a été modifié avec succès',
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleNotificationSave = () => {
    toast.success('Préférences de notification mises à jour', {
      description: 'Vos préférences de notification ont été enregistrées',
    });
  };
  
  const handleSecuritySave = () => {
    toast.success('Paramètres de sécurité mis à jour', {
      description: 'Vos paramètres de sécurité ont été enregistrés',
    });
  };

  return (
    <AppLayout showWelcomeMessage={false}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Paramètres</h1>
        <p className="text-bank-gray">Gérez vos informations personnelles et vos préférences</p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start md:w-auto">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User size={16} />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield size={16} />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell size={16} />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center space-x-2">
            <CreditCard size={16} />
            <span>Cartes</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Prénom</Label>
                    <Input
                      id="first-name"
                      className="bank-input"
                      defaultValue="Jean"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Nom</Label>
                    <Input
                      id="last-name"
                      className="bank-input"
                      defaultValue="Dupont"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="bank-input"
                      defaultValue="jean.dupont@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      className="bank-input"
                      defaultValue="06 12 34 56 78"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      className="bank-input"
                      defaultValue="123 Rue de Paris"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      className="bank-input"
                      defaultValue="Paris"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Code postal</Label>
                    <Input
                      id="postal-code"
                      className="bank-input"
                      defaultValue="75001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Select defaultValue="france">
                      <SelectTrigger id="country" className="bank-input">
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="france">France</SelectItem>
                        <SelectItem value="belgium">Belgique</SelectItem>
                        <SelectItem value="switzerland">Suisse</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button type="submit" className="bank-button">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>Changez votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        className="bank-input pr-10"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-bank-gray"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        className="bank-input pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-bank-gray"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        className="bank-input pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-bank-gray"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button type="submit" className="bank-button">
                    Changer le mot de passe
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>Configurez les options de sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Authentification à deux facteurs</h3>
                      <p className="text-sm text-bank-gray">Sécurisez votre compte avec une deuxième méthode d'authentification</p>
                    </div>
                    <Switch id="two-factor" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notifications de connexion</h3>
                      <p className="text-sm text-bank-gray">Recevez une notification chaque fois que quelqu'un se connecte à votre compte</p>
                    </div>
                    <Switch id="login-notifications" checked={loginAlerts} onCheckedChange={setLoginAlerts} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Verrouillage automatique de la session</h3>
                      <p className="text-sm text-bank-gray">Déconnectez-vous automatiquement après une période d'inactivité</p>
                    </div>
                    <Switch id="auto-logout" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Délai d'inactivité</Label>
                    <Select defaultValue="15">
                      <SelectTrigger id="timeout" className="bank-input">
                        <SelectValue placeholder="Sélectionnez un délai" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleSecuritySave} 
                    className="bank-button"
                  >
                    Enregistrer les paramètres
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Configurez comment et quand vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Canaux de notification</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Notifications par email</p>
                      <p className="text-sm text-bank-gray">Recevez des notifications sur votre adresse email</p>
                    </div>
                    <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Notifications par SMS</p>
                      <p className="text-sm text-bank-gray">Recevez des notifications par SMS sur votre téléphone</p>
                    </div>
                    <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium">Types de notification</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Alertes de transaction</p>
                        <p className="text-sm text-bank-gray">Soyez notifié pour chaque transaction sur vos comptes</p>
                      </div>
                      <Switch id="transaction-alerts" checked={transactionAlerts} onCheckedChange={setTransactionAlerts} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Alertes de solde bas</p>
                        <p className="text-sm text-bank-gray">Recevez une alerte lorsque votre solde est inférieur à un certain seuil</p>
                      </div>
                      <Switch id="balance-alerts" checked={lowBalanceAlerts} onCheckedChange={setLowBalanceAlerts} />
                    </div>
                    
                    {lowBalanceAlerts && (
                      <div className="space-y-2 pl-6">
                        <Label htmlFor="balance-threshold">Seuil d'alerte</Label>
                        <div className="relative">
                          <Input
                            id="balance-threshold"
                            className="bank-input pl-8"
                            defaultValue="200"
                          />
                          <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                            €
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Notifications de connexion</p>
                        <p className="text-sm text-bank-gray">Soyez alerté lorsque quelqu'un se connecte à votre compte</p>
                      </div>
                      <Switch id="login-notifications" checked={loginAlerts} onCheckedChange={setLoginAlerts} />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleNotificationSave} 
                    className="bank-button"
                  >
                    Enregistrer les préférences
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des cartes</CardTitle>
              <CardDescription>Gérez vos cartes bancaires et leurs paramètres</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border border-bank-gray-light p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/10">
                        <CreditCard className="h-5 w-5 text-bank-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Carte Visa Premium</p>
                        <p className="text-sm text-bank-gray">**** **** **** 7890</p>
                      </div>
                    </div>
                    <div>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="card-limit">Plafond de paiement</Label>
                      <div className="relative">
                        <Input
                          id="card-limit"
                          className="bank-input pl-8"
                          defaultValue="3000"
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                          €
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="withdrawal-limit">Plafond de retrait</Label>
                      <div className="relative">
                        <Input
                          id="withdrawal-limit"
                          className="bank-input pl-8"
                          defaultValue="1000"
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center text-bank-gray">
                          €
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Paiements en ligne</p>
                        <p className="text-sm text-bank-gray">Autoriser les paiements sur internet</p>
                      </div>
                      <Switch id="online-payments" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Paiements à l'étranger</p>
                        <p className="text-sm text-bank-gray">Autoriser les paiements hors de France</p>
                      </div>
                      <Switch id="foreign-payments" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p>Paiement sans contact</p>
                        <p className="text-sm text-bank-gray">Autoriser les paiements sans contact</p>
                      </div>
                      <Switch id="contactless-payments" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="bank-button-secondary text-sm">
                      Bloquer temporairement
                    </button>
                    <button className="bank-button-secondary text-sm">
                      Commander un remplacement
                    </button>
                    <button className="bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                      Signaler comme perdue/volée
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bank-button">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
