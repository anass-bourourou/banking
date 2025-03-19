
-- Création de la table d'historique des comptes
CREATE TABLE public.account_history (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    month VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    UNIQUE(account_id, month)
);

-- RLS (Row Level Security)
ALTER TABLE public.account_history ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à l'historique de leurs propres comptes
CREATE POLICY "Utilisateurs peuvent voir l'historique de leurs comptes" ON public.account_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE accounts.id = account_history.account_id 
            AND accounts.user_id = auth.uid()
        )
    );

-- Index pour améliorer les performances
CREATE INDEX idx_account_history_account_id ON public.account_history(account_id);
