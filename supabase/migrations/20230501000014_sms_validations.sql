
-- Création de la table de validation par SMS
CREATE TABLE public.sms_validations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_details JSONB NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- RLS (Row Level Security)
ALTER TABLE public.sms_validations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres validations
CREATE POLICY "Utilisateurs peuvent voir leurs propres validations" ON public.sms_validations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs propres validations" ON public.sms_validations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres validations" ON public.sms_validations
    FOR UPDATE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_sms_validations_user_id ON public.sms_validations(user_id);
