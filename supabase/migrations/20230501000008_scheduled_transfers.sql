
-- Création de la table des transferts programmés
CREATE TABLE public.scheduled_transfers (
    id SERIAL PRIMARY KEY,
    from_account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    to_account_id INTEGER REFERENCES public.accounts(id) ON DELETE SET NULL,
    beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    next_execution_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    CHECK ((to_account_id IS NOT NULL) OR (beneficiary_id IS NOT NULL))
);

-- RLS (Row Level Security)
ALTER TABLE public.scheduled_transfers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres transferts programmés
CREATE POLICY "Utilisateurs peuvent voir leurs propres transferts programmés" ON public.scheduled_transfers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres transferts programmés" ON public.scheduled_transfers
    FOR ALL USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_scheduled_transfers_user_id ON public.scheduled_transfers(user_id);
CREATE INDEX idx_scheduled_transfers_next_execution_date ON public.scheduled_transfers(next_execution_date);
CREATE INDEX idx_scheduled_transfers_status ON public.scheduled_transfers(status);
