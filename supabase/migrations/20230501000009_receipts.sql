
-- Création de la table des reçus
CREATE TABLE public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reference VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('bill', 'subscription', 'tax', 'other')),
    merchant VARCHAR(255) NOT NULL,
    file_url VARCHAR(255),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres reçus
CREATE POLICY "Utilisateurs peuvent voir leurs propres reçus" ON public.receipts
    FOR SELECT USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_receipts_date ON public.receipts(date);
CREATE INDEX idx_receipts_status ON public.receipts(status);
