
-- Création de la table des notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'alert')),
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES public.transactions(id) ON DELETE SET NULL,
    transfer_id INTEGER REFERENCES public.transfers(id) ON DELETE SET NULL
);

-- RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'accéder uniquement à leurs propres notifications
CREATE POLICY "Utilisateurs peuvent voir leurs propres notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_date ON public.notifications(date);
CREATE INDEX idx_notifications_read ON public.notifications(read);
