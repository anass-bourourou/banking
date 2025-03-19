
-- Création de la table des transferts
CREATE TABLE public.transfers (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    to_account_id INTEGER REFERENCES public.accounts(id) ON DELETE SET NULL,
    beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    is_instant BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    fees DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK ((to_account_id IS NOT NULL) OR (beneficiary_id IS NOT NULL))
);

-- RLS (Row Level Security)
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres transferts
CREATE POLICY "Utilisateurs peuvent voir leurs propres transferts" ON public.transfers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE accounts.id = transfers.from_account_id 
            AND accounts.user_id = auth.uid()
        )
    );

-- Index pour améliorer les performances
CREATE INDEX idx_transfers_from_account_id ON public.transfers(from_account_id);
CREATE INDEX idx_transfers_to_account_id ON public.transfers(to_account_id);
CREATE INDEX idx_transfers_beneficiary_id ON public.transfers(beneficiary_id);
CREATE INDEX idx_transfers_date ON public.transfers(date);
