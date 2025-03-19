
-- Fonction pour mettre à jour l'historique des comptes
CREATE OR REPLACE FUNCTION public.update_account_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_month TEXT;
    v_year INTEGER;
    v_month_key TEXT;
BEGIN
    -- Déterminer le mois et l'année actuels
    v_month := to_char(current_date, 'TMMonth');
    v_year := extract(year from current_date);
    v_month_key := v_month || ' ' || v_year;
    
    -- Vérifier si une entrée existe déjà pour ce mois
    IF EXISTS (
        SELECT 1 FROM public.account_history 
        WHERE account_id = NEW.id AND month = v_month_key
    ) THEN
        -- Mettre à jour l'entrée existante
        UPDATE public.account_history
        SET amount = NEW.balance
        WHERE account_id = NEW.id AND month = v_month_key;
    ELSE
        -- Créer une nouvelle entrée
        INSERT INTO public.account_history (account_id, month, amount)
        VALUES (NEW.id, v_month_key, NEW.balance);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Créer un déclencheur pour mettre à jour l'historique chaque fois que le solde d'un compte change
CREATE TRIGGER update_account_history_on_balance_change
AFTER INSERT OR UPDATE OF balance ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_account_history();
