
-- Création de la table des comptes
CREATE TABLE public.accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(50) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Maroc',
    address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres comptes
CREATE POLICY "Utilisateurs peuvent voir leurs propres comptes" ON public.accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres comptes" ON public.accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
