
-- Création de la table des transactions
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    recipient_name VARCHAR(255),
    recipient_account VARCHAR(100),
    transfer_type VARCHAR(20) CHECK (transfer_type IN ('standard', 'instant', 'scheduled', 'mass')),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    reference_id VARCHAR(100),
    fees DECIMAL(10, 2)
);

-- RLS (Row Level Security)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres transactions
CREATE POLICY "Utilisateurs peuvent voir leurs propres transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE accounts.id = transactions.account_id 
            AND accounts.user_id = auth.uid()
        )
    );

-- Index pour améliorer les performances
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
