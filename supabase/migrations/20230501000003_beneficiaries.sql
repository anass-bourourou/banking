
-- Création de la table des bénéficiaires
CREATE TABLE public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    iban VARCHAR(50) NOT NULL,
    bic VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name VARCHAR(255),
    address TEXT,
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres bénéficiaires
CREATE POLICY "Utilisateurs peuvent voir leurs propres bénéficiaires" ON public.beneficiaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres bénéficiaires" ON public.beneficiaries
    FOR ALL USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_favorite ON public.beneficiaries(favorite);
