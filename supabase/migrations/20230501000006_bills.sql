
-- Création de la table des factures
CREATE TABLE public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DGI', 'CIM', 'OTHER')),
    amount DECIMAL(15, 2) NOT NULL,
    dueDate TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paymentDate TIMESTAMP WITH TIME ZONE,
    description TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres factures
CREATE POLICY "Utilisateurs peuvent voir leurs propres factures" ON public.bills
    FOR SELECT USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_bills_user_id ON public.bills(user_id);
CREATE INDEX idx_bills_dueDate ON public.bills(dueDate);
CREATE INDEX idx_bills_status ON public.bills(status);
