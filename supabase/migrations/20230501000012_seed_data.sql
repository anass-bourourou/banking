
-- Script pour ajouter des données initiales (à exécuter manuellement après avoir créé un utilisateur)
/*
-- Remplacez 'USER_ID_HERE' par l'ID de l'utilisateur après inscription
INSERT INTO public.accounts (name, number, balance, currency, user_id) VALUES
('Compte Courant', '123456789', 10000.00, 'MAD', 'USER_ID_HERE'),
('Compte Épargne', '987654321', 5000.00, 'MAD', 'USER_ID_HERE');

-- Ajoutez quelques bénéficiaires
INSERT INTO public.beneficiaries (name, iban, bic, email, user_id, bank_name, favorite) VALUES
('Mohamed Alami', 'MA123456789012345678901234', 'BMCEMAMC', 'mohamed@example.com', 'USER_ID_HERE', 'Banque Populaire', true),
('Fatima Benali', 'MA987654321098765432109876', 'BCMAMAMC', 'fatima@example.com', 'USER_ID_HERE', 'Attijariwafa Bank', false);

-- Ajoutez quelques factures
INSERT INTO public.bills (reference, type, amount, dueDate, status, description, user_id) VALUES
('ELEC-2023-05', 'OTHER', 450.75, NOW() + INTERVAL '10 days', 'pending', 'Facture Électricité Mai 2023', 'USER_ID_HERE'),
('TAXE-2023-01', 'DGI', 1200.00, NOW() + INTERVAL '30 days', 'pending', 'Taxe Professionnelle 2023', 'USER_ID_HERE');

-- Ajoutez quelques notifications
INSERT INTO public.notifications (title, message, type, date, read, user_id) VALUES
('Bienvenue', 'Bienvenue sur notre application bancaire.', 'info', NOW(), false, 'USER_ID_HERE'),
('Nouveau service', 'Découvrez notre nouveau service de paiement mobile.', 'info', NOW() - INTERVAL '2 days', false, 'USER_ID_HERE');
*/
