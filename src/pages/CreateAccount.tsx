
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAccountForm } from "@/components/auth/CreateAccountForm";
import { BankLogo } from "@/components/auth/BankLogo";

const CreateAccount = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bank-primary/10 to-white p-4">
      <BankLogo />
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Veuillez remplir les informations suivantes pour créer votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAccountForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAccount;
