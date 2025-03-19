
-- Création de la table des relevés bancaires
CREATE TABLE public.statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    period VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    file_path VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'processing')),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres relevés
CREATE POLICY "Utilisateurs peuvent voir leurs propres relevés" ON public.statements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE accounts.id = statements.account_id 
            AND accounts.user_id = auth.uid()
        )
    );

-- Index pour améliorer les performances
CREATE INDEX idx_statements_account_id ON public.statements(account_id);
CREATE INDEX idx_statements_date ON public.statements(date);
