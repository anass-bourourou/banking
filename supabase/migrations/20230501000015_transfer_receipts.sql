
-- Création de la table des reçus de virements
CREATE TABLE public.transfer_receipts (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER NOT NULL,
    transfer_type VARCHAR(50) NOT NULL, -- 'standard', 'multiple', 'instantané'
    sender_account_id INTEGER NOT NULL REFERENCES public.accounts(id),
    recipient_details JSONB NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD',
    motif TEXT,
    fees DECIMAL(15, 2) DEFAULT 0,
    reference_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    execution_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.transfer_receipts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres reçus
CREATE POLICY "Utilisateurs peuvent voir leurs propres reçus" ON public.transfer_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.accounts 
            WHERE accounts.id = transfer_receipts.sender_account_id 
            AND accounts.user_id = auth.uid()
        )
    );

-- Index pour améliorer les performances
CREATE INDEX idx_transfer_receipts_transfer_id ON public.transfer_receipts(transfer_id);
CREATE INDEX idx_transfer_receipts_sender_account_id ON public.transfer_receipts(sender_account_id);
