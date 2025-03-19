
-- Fonction pour effectuer un transfert entre comptes ou vers un bénéficiaire
CREATE OR REPLACE FUNCTION public.perform_transfer(
    p_from_account_id INTEGER,
    p_to_account_id INTEGER DEFAULT NULL,
    p_beneficiary_id UUID DEFAULT NULL,
    p_amount DECIMAL,
    p_description TEXT DEFAULT 'Transfert',
    p_is_instant BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    transfer_id INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_from_account RECORD;
    v_to_account RECORD;
    v_user_id UUID;
    v_beneficiary RECORD;
    v_fees DECIMAL := 0;
    v_transfer_id INTEGER;
BEGIN
    -- Vérifier que l'utilisateur est propriétaire du compte source
    SELECT * INTO v_from_account FROM public.accounts WHERE id = p_from_account_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Compte source introuvable', NULL::INTEGER;
        RETURN;
    END IF;
    
    v_user_id := v_from_account.user_id;
    
    -- Vérifier que l'utilisateur actuel est le propriétaire du compte
    IF v_user_id != auth.uid() THEN
        RETURN QUERY SELECT FALSE, 'Non autorisé à utiliser ce compte', NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Calculer les frais si le transfert est instantané
    IF p_is_instant THEN
        v_fees := p_amount * 0.01; -- 1% de frais pour les transferts instantanés
    END IF;
    
    -- Vérifier que le solde est suffisant
    IF v_from_account.balance < (p_amount + v_fees) THEN
        RETURN QUERY SELECT FALSE, 'Solde insuffisant', NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Si c'est un transfert vers un autre compte interne
    IF p_to_account_id IS NOT NULL THEN
        -- Vérifier que le compte de destination existe
        SELECT * INTO v_to_account FROM public.accounts WHERE id = p_to_account_id;
        
        IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, 'Compte destinataire introuvable', NULL::INTEGER;
            RETURN;
        END IF;
        
        -- Créer l'enregistrement de transfert
        INSERT INTO public.transfers (
            from_account_id, 
            to_account_id, 
            amount, 
            description, 
            date, 
            is_instant, 
            status, 
            fees
        ) VALUES (
            p_from_account_id,
            p_to_account_id,
            p_amount,
            p_description,
            NOW(),
            p_is_instant,
            'completed',
            v_fees
        ) RETURNING id INTO v_transfer_id;
        
        -- Mettre à jour les soldes des comptes
        UPDATE public.accounts
        SET balance = balance - (p_amount + v_fees)
        WHERE id = p_from_account_id;
        
        UPDATE public.accounts
        SET balance = balance + p_amount
        WHERE id = p_to_account_id;
        
        -- Créer les transactions correspondantes
        INSERT INTO public.transactions (
            description,
            amount,
            type,
            date,
            account_id,
            recipient_name,
            recipient_account,
            transfer_type,
            status,
            reference_id,
            fees
        ) VALUES (
            p_description || ' (débit)',
            p_amount,
            'debit',
            NOW(),
            p_from_account_id,
            v_to_account.name,
            v_to_account.number,
            CASE WHEN p_is_instant THEN 'instant' ELSE 'standard' END,
            'completed',
            v_transfer_id::text,
            v_fees
        );
        
        INSERT INTO public.transactions (
            description,
            amount,
            type,
            date,
            account_id,
            recipient_name,
            recipient_account,
            transfer_type,
            status,
            reference_id
        ) VALUES (
            p_description || ' (crédit)',
            p_amount,
            'credit',
            NOW(),
            p_to_account_id,
            v_from_account.name,
            v_from_account.number,
            CASE WHEN p_is_instant THEN 'instant' ELSE 'standard' END,
            'completed',
            v_transfer_id::text
        );
        
    -- Si c'est un transfert vers un bénéficiaire externe
    ELSIF p_beneficiary_id IS NOT NULL THEN
        -- Vérifier que le bénéficiaire existe et appartient à l'utilisateur
        SELECT * INTO v_beneficiary FROM public.beneficiaries 
        WHERE id = p_beneficiary_id AND user_id = v_user_id;
        
        IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, 'Bénéficiaire introuvable ou non autorisé', NULL::INTEGER;
            RETURN;
        END IF;
        
        -- Créer l'enregistrement de transfert
        INSERT INTO public.transfers (
            from_account_id, 
            beneficiary_id, 
            amount, 
            description, 
            date, 
            is_instant, 
            status, 
            fees
        ) VALUES (
            p_from_account_id,
            p_beneficiary_id,
            p_amount,
            p_description,
            NOW(),
            p_is_instant,
            'completed',
            v_fees
        ) RETURNING id INTO v_transfer_id;
        
        -- Mettre à jour le solde du compte source
        UPDATE public.accounts
        SET balance = balance - (p_amount + v_fees)
        WHERE id = p_from_account_id;
        
        -- Créer la transaction correspondante
        INSERT INTO public.transactions (
            description,
            amount,
            type,
            date,
            account_id,
            recipient_name,
            recipient_account,
            transfer_type,
            status,
            reference_id,
            fees
        ) VALUES (
            p_description || ' vers ' || v_beneficiary.name,
            p_amount,
            'debit',
            NOW(),
            p_from_account_id,
            v_beneficiary.name,
            v_beneficiary.iban,
            CASE WHEN p_is_instant THEN 'instant' ELSE 'standard' END,
            'completed',
            v_transfer_id::text,
            v_fees
        );
    ELSE
        RETURN QUERY SELECT FALSE, 'Vous devez spécifier un compte destinataire ou un bénéficiaire', NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Créer une notification pour l'utilisateur
    INSERT INTO public.notifications (
        title,
        message,
        type,
        date,
        read,
        user_id,
        transfer_id
    ) VALUES (
        'Transfert effectué',
        'Transfert de ' || p_amount || ' ' || v_from_account.currency || ' effectué avec succès.',
        'info',
        NOW(),
        false,
        v_user_id,
        v_transfer_id
    );
    
    RETURN QUERY SELECT TRUE, 'Transfert effectué avec succès', v_transfer_id;
END;
$$;
