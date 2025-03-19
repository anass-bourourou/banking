
-- Création de la table des réclamations
CREATE TABLE public.complaints (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    category VARCHAR(100),
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE
);

-- RLS (Row Level Security)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres réclamations
CREATE POLICY "Utilisateurs peuvent voir leurs propres réclamations" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs propres réclamations" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres réclamations" ON public.complaints
    FOR UPDATE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
