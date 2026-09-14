-- ============================================================
-- SIMBA_CTD - JEU DE DONNEES DE DEMONSTRATION
-- 50 ENREGISTREMENTS PAR TABLE
-- PostgreSQL 16 / schéma canonique après alignements V20
-- ============================================================
-- Les identifiants sont déterministes pour permettre de rejouer
-- le seed sans créer de doublons.
--
-- La table historique "ligne_mandat" n'est volontairement pas alimentée :
-- elle a été supprimée lors de la consolidation du schéma.
-- La relation actuelle est "mandat_liquidations".
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================
-- 1. COLLECTIVITES
-- ============================================================

WITH ctds(n, code, nom, type, region, departement, arrondissement) AS (
    VALUES
    (1,'CTD-YDE-008','Commune de Yaoundé VIII','COMMUNE','Centre','Mefou et Afamba','Yaoundé VIII'),
    (2,'CTD-YDE-002','Commune de Yaoundé II','COMMUNE','Centre','Mfoundi','Yaoundé II'),
    (3,'CTD-YDE-003','Commune de Yaoundé III','COMMUNE','Centre','Mfoundi','Yaoundé III'),
    (4,'CTD-YDE-004','Commune de Yaoundé IV','COMMUNE','Centre','Mfoundi','Yaoundé IV'),
    (5,'CTD-YDE-005','Commune de Yaoundé V','COMMUNE','Centre','Mfoundi','Yaoundé V'),
    (6,'CTD-YDE-006','Commune de Yaoundé VI','COMMUNE','Centre','Mfoundi','Yaoundé VI'),
    (7,'CTD-YDE-007','Commune de Yaoundé VII','COMMUNE','Centre','Mfoundi','Yaoundé VII'),
    (8,'CTD-DLA-007','Commune de Douala VII','COMMUNE','Littoral','Wouri','Douala VII'),
    (9,'CTD-DLA-002','Commune de Douala II','COMMUNE','Littoral','Wouri','Douala II'),
    (10,'CTD-DLA-003','Commune de Douala III','COMMUNE','Littoral','Wouri','Douala III'),
    (11,'CTD-DLA-004','Commune de Douala IV','COMMUNE','Littoral','Wouri','Douala IV'),
    (12,'CTD-DLA-005','Commune de Douala V','COMMUNE','Littoral','Wouri','Douala V'),
    (13,'CTD-DLA-006','Commune de Douala VI','COMMUNE','Littoral','Wouri','Douala VI'),
    (14,'CTD-BFM-001','Commune de Bafoussam I','COMMUNE','Ouest','Mifi','Bafoussam I'),
    (15,'CTD-BFM-002','Commune de Bafoussam II','COMMUNE','Ouest','Mifi','Bafoussam II'),
    (16,'CTD-BFM-003','Commune de Bafoussam III','COMMUNE','Ouest','Mifi','Bafoussam III'),
    (17,'CTD-BDA-001','Commune de Bamenda I','COMMUNE','Nord-Ouest','Mezam','Bamenda I'),
    (18,'CTD-BDA-002','Commune de Bamenda II','COMMUNE','Nord-Ouest','Mezam','Bamenda II'),
    (19,'CTD-BDA-003','Commune de Bamenda III','COMMUNE','Nord-Ouest','Mezam','Bamenda III'),
    (20,'CTD-GRA-001','Commune de Garoua I','COMMUNE','Nord','Bénoué','Garoua I'),
    (21,'CTD-GRA-002','Commune de Garoua II','COMMUNE','Nord','Bénoué','Garoua II'),
    (22,'CTD-GRA-003','Commune de Garoua III','COMMUNE','Nord','Bénoué','Garoua III'),
    (23,'CTD-MRA-001','Commune de Maroua I','COMMUNE','Extrême-Nord','Diamaré','Maroua I'),
    (24,'CTD-MRA-002','Commune de Maroua II','COMMUNE','Extrême-Nord','Diamaré','Maroua II'),
    (25,'CTD-MRA-003','Commune de Maroua III','COMMUNE','Extrême-Nord','Diamaré','Maroua III'),
    (26,'CTD-BUE-001','Commune de Buéa','COMMUNE','Sud-Ouest','Fako','Buéa'),
    (27,'CTD-LIM-001','Commune de Limbé I','COMMUNE','Sud-Ouest','Fako','Limbé I'),
    (28,'CTD-LIM-002','Commune de Limbé II','COMMUNE','Sud-Ouest','Fako','Limbé II'),
    (29,'CTD-LIM-003','Commune de Limbé III','COMMUNE','Sud-Ouest','Fako','Limbé III'),
    (30,'CTD-KRI-001','Commune de Kribi I','COMMUNE','Sud','Océan','Kribi I'),
    (31,'CTD-KRI-002','Commune de Kribi II','COMMUNE','Sud','Océan','Kribi II'),
    (32,'CTD-EDÉ-001','Commune d''Edéa I','COMMUNE','Littoral','Sanaga-Maritime','Edéa I'),
    (33,'CTD-EDÉ-002','Commune d''Edéa II','COMMUNE','Littoral','Sanaga-Maritime','Edéa II'),
    (34,'CTD-NKS-001','Commune de Nkongsamba I','COMMUNE','Littoral','Moungo','Nkongsamba I'),
    (35,'CTD-NKS-002','Commune de Nkongsamba II','COMMUNE','Littoral','Moungo','Nkongsamba II'),
    (36,'CTD-NKS-003','Commune de Nkongsamba III','COMMUNE','Littoral','Moungo','Nkongsamba III'),
    (37,'CTD-BAF-001','Commune de Bafang','COMMUNE','Ouest','Haut-Nkam','Bafang'),
    (38,'CTD-BAN-001','Commune de Bangangté','COMMUNE','Ouest','Ndé','Bangangté'),
    (39,'CTD-BAT-001','Commune de Batouri','COMMUNE','Est','Kadey','Batouri'),
    (40,'CTD-BER-001','Commune de Bertoua I','COMMUNE','Est','Lom-et-Djerem','Bertoua I'),
    (41,'CTD-BER-002','Commune de Bertoua II','COMMUNE','Est','Lom-et-Djerem','Bertoua II'),
    (42,'CTD-EBO-003','Commune d''Ebolowa III','COMMUNE','Sud','Mvila','Ebolowa III '),
    (43,'CTD-EBO-002','Commune d''Ebolowa II','COMMUNE','Sud','Mvila','Ebolowa II'),
    (44,'CTD-KUM-001','Commune de Kumba I','COMMUNE','Sud-Ouest','Meme','Kumba I'),
    (45,'CTD-KUM-002','Commune de Kumba II','COMMUNE','Sud-Ouest','Meme','Kumba II'),
    (46,'CTD-KUM-003','Commune de Kumba III','COMMUNE','Sud-Ouest','Meme','Kumba III'),
    (47,'CTD-FIG-001','Commune de Foumban','COMMUNE','Ouest','Noun','Foumban'),
    (48,'CTD-FOU-001','Commune de Foumbot','COMMUNE','Ouest','Noun','Foumbot'),
    (49,'CTD-MBA-001','Commune de Mbouda','COMMUNE','Ouest','Bamboutos','Mbouda'),
    (50,'CTD-DCH-001','Commune de Dschang','COMMUNE','Ouest','Menoua','Dschang')
)
INSERT INTO collectivites (
    id, code, nom, type, region, departement, arrondissement,
    adresse, telephone, email, statut
)
SELECT
    md5('demo-ctd-' || n)::uuid,
    code,
    nom,
    type::type_collectivite,
    region,
    departement,
    arrondissement,
    'Hôtel de ville, ' || arrondissement,
    '+237 655' || lpad(n::text, 6, '0'),
    'secretariat.' || lower(regexp_replace(code, '[^a-zA-Z0-9]', '', 'g')) || '@ctd.simba.test',
    CASE
        WHEN n % 13 = 0 THEN 'SUSPENDUE'::statut_collectivite
        ELSE 'ACTIVE'::statut_collectivite
    END
FROM ctds
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. CONFIGURATIONS VISUELLES
-- ============================================================

INSERT INTO configurations_visuelles (
    id, collectivite_id, couleur_primaire, couleur_secondaire,
    couleur_accent, couleur_succes, couleur_avertissement,
    couleur_erreur, couleur_information, couleur_fond,
    couleur_surface, couleur_texte, variables_css
)
SELECT
    md5('demo-config-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    CASE ((n - 1) % 8)
        WHEN 0 THEN '#14532D'
        WHEN 1 THEN '#1D4ED8'
        WHEN 2 THEN '#7C3AED'
        WHEN 3 THEN '#0369A1'
        WHEN 4 THEN '#0F766E'
        WHEN 5 THEN '#9A3412'
        WHEN 6 THEN '#BE123C'
        ELSE '#4338CA'
    END,
    '#64748B',
    '#D9A441',
    '#16A34A',
    '#F59E0B',
    '#DC2626',
    '#2563EB',
    '#FFFFFF',
    '#F8FAFC',
    '#0F172A',
    jsonb_build_object('demo', true, 'collectivite', n)
FROM generate_series(1,50) n
ON CONFLICT (collectivite_id) DO NOTHING;

-- ============================================================
-- 3. PARAMETRES REGLEMENTAIRES
-- ============================================================

INSERT INTO parametres_reglementaires (
    id, collectivite_id, code, libelle,
    valeur_numerique, unite, description, actif
)
SELECT
    md5('demo-param-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    'TVA_STANDARD',
    'Taux TVA standard',
    19.25,
    '%',
    'Paramètre réglementaire de démonstration',
    TRUE
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. MENUS
-- ============================================================

INSERT INTO menus (
    id, collectivite_id, code, libelle, chemin, ordre, roles_autorises
)
SELECT
    md5('demo-menu-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    'REPORTING',
    'Reporting',
    '/dashboard/reporting',
    1,
    '["ADMINISTRATEUR","ORDONNATEUR","CONTROLEUR_FINANCIER","RECEVEUR"]'::jsonb
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. FONCTIONNALITES COLLECTIVITES
-- ============================================================

INSERT INTO fonctionnalites_collectivites (
    id, collectivite_id, code, active, configuration
)
SELECT
    md5('demo-feature-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    'REPORTING_IA',
    TRUE,
    jsonb_build_object(
        'demo', true,
        'ia_reporting', true,
        'niveau', CASE WHEN n % 5 = 0 THEN 'AVANCE' ELSE 'STANDARD' END
    )
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. UTILISATEURS
-- ============================================================

INSERT INTO utilisateurs (
    id, identifiant_keycloak, nom_utilisateur, prenom, nom,
    email, telephone, matricule, collectivite_id, role, statut
)
SELECT
    md5('demo-user-' || n)::uuid,
    'demo-keycloak-' || n,
    'demo.user.' || n,
    CASE ((n - 1) % 7)
        WHEN 0 THEN 'Admin'
        WHEN 1 THEN 'Ordonnateur'
        WHEN 2 THEN 'Controleur'
        WHEN 3 THEN 'Receveur'
        WHEN 4 THEN 'Regisseur'
        WHEN 5 THEN 'Chef'
        ELSE 'Cosignataire'
    END,
    'Démonstration ' || n,
    'utilisateur' || n || '@demo.simba.test',
    '+237 690' || lpad(n::text, 6, '0'),
    'MAT-DEMO-' || lpad(n::text, 4, '0'),
    md5('demo-ctd-' || n)::uuid,
    (ARRAY[
        'ADMINISTRATEUR',
        'ORDONNATEUR',
        'CONTROLEUR_FINANCIER',
        'RECEVEUR',
        'REGISSEUR',
        'CHEF_SERVICE',
        'COSIGNATAIRE'
    ]::role_application[])[((n - 1) % 7) + 1],
    CASE
        WHEN n % 11 = 0 THEN 'SUSPENDU'::statut_utilisateur
        ELSE 'ACTIF'::statut_utilisateur
    END
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. TIERS
-- ============================================================

INSERT INTO tiers (
    id, collectivite_id, code, raison_sociale,
    numero_contribuable, registre_commerce, adresse,
    telephone, email, compte_bancaire, banque, actif
)
SELECT
    md5('demo-tiers-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    'TIERS-' || lpad(n::text, 3, '0'),
    'Prestataire Démonstration ' || n,
    'NIU-DEMO-' || lpad(n::text, 5, '0'),
    'RC-DEMO-' || lpad(n::text, 5, '0'),
    'Adresse prestataire ' || n || ', Cameroun',
    '+237 677' || lpad(n::text, 6, '0'),
    'tiers' || n || '@demo.simba.test',
    'CM21 10000 00000 DEMO ' || lpad(n::text, 4, '0'),
    CASE ((n - 1) % 4)
        WHEN 0 THEN 'Afriland First Bank'
        WHEN 1 THEN 'UBA Cameroun'
        WHEN 2 THEN 'SCB Cameroun'
        ELSE 'BICEC'
    END,
    TRUE
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 8. EXERCICES BUDGETAIRES
-- ============================================================

INSERT INTO exercices_budgetaires (
    id, collectivite_id, annee, type_exercice,
    date_debut, date_fin, actif, cloture
)
SELECT
    md5('demo-exercice-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    2026,
    'NORMAL'::type_exercice,
    DATE '2026-01-01',
    DATE '2026-12-31',
    TRUE,
    FALSE
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. BUDGETS
-- ============================================================

INSERT INTO budgets (
    id, collectivite_id, exercice_id, type_budget,
    numero, libelle, montant_total, statut, date_approbation
)
SELECT
    md5('demo-budget-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-exercice-' || n)::uuid,
    'PRIMITIF'::type_budget,
    'BP-2026-' || lpad(n::text, 3, '0'),
    'Budget primitif 2026 - Démonstration ' || n,
    50000000 + n * 250000,
    'APPROUVE'::statut_budget,
    DATE '2026-01-10'
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. LIGNES BUDGETAIRES
-- ============================================================

INSERT INTO lignes_budgetaires (
    id, collectivite_id, exercice_id, budget_id,
    code, libelle, section, chapitre, article, compte,
    credit_vote, credit_modifie, credit_engage,
    credit_liquide, credit_mandate, credit_paye
)
SELECT
    md5('demo-ligne-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-exercice-' || n)::uuid,
    md5('demo-budget-' || n)::uuid,
    'LB-' || lpad(n::text, 3, '0'),
    CASE ((n - 1) % 6)
        WHEN 0 THEN 'Fournitures et fonctionnement'
        WHEN 1 THEN 'Travaux et investissements'
        WHEN 2 THEN 'Services extérieurs'
        WHEN 3 THEN 'Personnel et charges'
        WHEN 4 THEN 'Transferts et subventions'
        ELSE 'Équipements et matériels'
    END || ' - Démo ' || n,
    CASE WHEN n % 2 = 0 THEN 'INVESTISSEMENT' ELSE 'FONCTIONNEMENT' END,
    'CH-' || lpad(((n - 1) % 9 + 1)::text, 2, '0'),
    'ART-' || lpad(n::text, 3, '0'),
    '6' || lpad(n::text, 3, '0'),
    10000000 + n * 100000,
    10500000 + n * 100000,
    500000 + n * 12000,
    400000 + n * 10000,
    350000 + n * 9000,
    300000 + n * 8000
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. DOCUMENTS PREPARATOIRES
-- ============================================================

INSERT INTO documents_preparatoires (
    id, collectivite_id, reference, type_document,
    objet, tiers_id, montant_ht, montant_taxes, montant_ttc,
    date_document, montant_consomme, montant_restant, statut, metadata
)
SELECT
    md5('demo-document-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    'M5-DEMO-' || lpad(n::text, 3, '0'),
    CASE ((n - 1) % 4)
        WHEN 0 THEN 'BON_COMMANDE'::type_engagement
        WHEN 1 THEN 'LETTRE_COMMANDE'::type_engagement
        WHEN 2 THEN 'MARCHE'::type_engagement
        ELSE 'PROVISIONNEL'::type_engagement
    END,
    'Document préparatoire M5 de démonstration ' || n,
    md5('demo-tiers-' || n)::uuid,
    100000 + n * 10000,
    ROUND((100000 + n * 10000) * 0.1925, 2),
    ROUND((100000 + n * 10000) * 1.1925, 2),
    DATE '2026-02-01' + ((n - 1) % 28),
    0,
    ROUND((100000 + n * 10000) * 1.1925, 2),
    'VALIDE',
    jsonb_build_object('source','DEMO','numero',n)
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 12. ENGAGEMENTS
-- ============================================================

INSERT INTO engagements (
    id, collectivite_id, exercice_id, ligne_budgetaire_id, tiers_id,
    document_preparatoire_id, numero, type_engagement, objet,
    montant_ht, montant_taxes, montant_ttc, montant_engage,
    statut, date_engagement, soumis_cf_at, vise_cf_at,
    utilisateur_createur_id, credits_reserves, metadata, date_creation,
    documentm5id, etat, lignebudgetaire_id, montantht, montant_impot,
    montantttc, montanttva, numero_engagement, ordonnator_id,
    taux_impot, tauxtva
)
SELECT
    md5('demo-engagement-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-exercice-' || n)::uuid,
    md5('demo-ligne-' || n)::uuid,
    md5('demo-tiers-' || n)::uuid,
    md5('demo-document-' || n)::uuid,
    'ENG-DEMO-' || lpad(n::text, 3, '0'),
    CASE ((n - 1) % 4)
        WHEN 0 THEN 'BON_COMMANDE'::type_engagement
        WHEN 1 THEN 'LETTRE_COMMANDE'::type_engagement
        WHEN 2 THEN 'MARCHE'::type_engagement
        ELSE 'PROVISIONNEL'::type_engagement
    END,
    'Engagement budgétaire de démonstration ' || n,
    100000 + n * 10000,
    ROUND((100000 + n * 10000) * 0.1925, 2),
    ROUND((100000 + n * 10000) * 1.1925, 2),
    ROUND((100000 + n * 10000) * 1.1925, 2),
    CASE
        WHEN n % 10 = 0 THEN 'REJET'::statut_engagement
        WHEN n % 4 = 0 THEN 'SOUMIS_CF'::statut_engagement
        ELSE 'CONFIRME'::statut_engagement
    END,
    DATE '2026-03-01' + ((n - 1) % 28),
    CASE WHEN n % 10 <> 0 THEN TIMESTAMPTZ '2026-03-03 10:00:00+01' ELSE NULL END,
    CASE WHEN n % 10 <> 0 AND n % 4 <> 0 THEN TIMESTAMPTZ '2026-03-10 10:00:00+01' ELSE NULL END,
    md5('demo-user-' || n)::uuid,
    CASE WHEN n % 10 = 0 THEN FALSE ELSE TRUE END,
    jsonb_build_object('source','DEMO','tva',19.25,'numero',n),
    TIMESTAMPTZ '2026-03-01 09:00:00+01' + ((n - 1) * INTERVAL '1 day'),
    md5('demo-document-' || n)::uuid,
    CASE
        WHEN n % 10 = 0 THEN 'REJET'
        WHEN n % 4 = 0 THEN 'SOUMIS_CF'
        ELSE 'CONFIRME'
    END,
    md5('demo-ligne-' || n)::uuid,
    100000 + n * 10000,
    0,
    ROUND((100000 + n * 10000) * 1.1925, 2),
    ROUND((100000 + n * 10000) * 0.1925, 2),
    'ENG-DEMO-' || lpad(n::text, 3, '0'),
    md5('demo-user-' || n)::uuid,
    0,
    19.25
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 13. AVIS CONTROLE FINANCIER
-- ============================================================

INSERT INTO avis_controle_financier (
    id, collectivite_id, engagement_id, controleur_id,
    type_avis, observations, reserves, date_reception,
    date_decision, reference_document
)
SELECT
    md5('demo-avis-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-engagement-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    CASE
        WHEN n % 10 = 0 THEN 'REJET'::type_avis_controle
        WHEN n % 7 = 0 THEN 'VISA_AVEC_RESERVES'::type_avis_controle
        WHEN n % 5 = 0 THEN 'VISA_AVEC_OBSERVATIONS'::type_avis_controle
        ELSE 'VISA'::type_avis_controle
    END,
    'Avis de contrôle financier de démonstration ' || n,
    CASE WHEN n % 7 = 0 THEN 'Réserve de démonstration' ELSE NULL END,
    TIMESTAMPTZ '2026-03-05 09:00:00+01' + (n * INTERVAL '1 day'),
    TIMESTAMPTZ '2026-03-06 09:00:00+01' + (n * INTERVAL '1 day'),
    'DOC-CF-DEMO-' || lpad(n::text, 3, '0')
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 14. LIQUIDATIONS
-- ============================================================

INSERT INTO liquidations (
    id, collectivite_id, engagement_id, numero,
    type_facture, numero_facture, date_facture,
    montant_ht, montant_taxes, montant_ttc, montant_nap,
    statut, service_fait_at, conformite_fiscale, observations,
    date_creation, montant_impot_retenue, taux_impot_retenue, tauxtva
)
SELECT
    md5('demo-liquidation-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-engagement-' || n)::uuid,
    'LIQ-DEMO-' || lpad(n::text, 3, '0'),
    CASE ((n - 1) % 4)
        WHEN 0 THEN 'COMPLETE'::type_facture
        WHEN 1 THEN 'PARTIELLE'::type_facture
        WHEN 2 THEN 'PRO_FORMA'::type_facture
        ELSE 'RECTIFICATIVE'::type_facture
    END,
    'FAC-DEMO-' || lpad(n::text, 3, '0'),
    DATE '2026-04-01' + ((n - 1) % 25),
    100000 + n * 10000,
    ROUND((100000 + n * 10000) * 0.1925, 2),
    ROUND((100000 + n * 10000) * 1.1925, 2),
    ROUND((100000 + n * 10000) * 1.10, 2),
    CASE
        WHEN n % 10 = 0 THEN 'REJETEE'::statut_liquidation
        WHEN n % 4 = 0 THEN 'SOUMISE_CF'::statut_liquidation
        ELSE 'PRETE_ORDONNANCEMENT'::statut_liquidation
    END,
    TIMESTAMPTZ '2026-04-05 10:00:00+01' + (n * INTERVAL '1 day'),
    TRUE,
    'Liquidation de démonstration ' || n,
    TIMESTAMPTZ '2026-04-01 09:00:00+01' + ((n - 1) * INTERVAL '1 day'),
    0,
    0,
    19.25
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 15. MANDATS
-- ============================================================

INSERT INTO mandats (
    id, collectivite_id, exercice_id, numero,
    type_mandat, montant_total, statut, date_mandatement,
    ordonnateur_id, controleur_id, receveur_id,
    bordereau_numero, depense_validee_at
)
SELECT
    md5('demo-mandat-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-exercice-' || n)::uuid,
    'MAN-DEMO-' || lpad(n::text, 3, '0'),
    CASE ((n - 1) % 5)
        WHEN 0 THEN 'INDIVIDUEL'::type_mandat
        WHEN 1 THEN 'COLLECTIF'::type_mandat
        WHEN 2 THEN 'REGULARISATION'::type_mandat
        WHEN 3 THEN 'RETENUE_GARANTIE'::type_mandat
        ELSE 'REGLEMENT_OFFICE'::type_mandat
    END,
    ROUND((100000 + n * 10000) * 1.1925, 2),
    CASE
        WHEN n % 10 = 0 THEN 'REJETE_CF'::statut_mandat
        WHEN n % 4 = 0 THEN 'SOUMIS_CF'::statut_mandat
        ELSE 'TRANSMIS_RECEVEUR'::statut_mandat
    END,
    DATE '2026-05-01' + ((n - 1) % 20),
    md5('demo-user-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    'BOR-DEMO-' || lpad(n::text, 3, '0'),
    CASE
        WHEN n % 4 <> 0 AND n % 10 <> 0
        THEN TIMESTAMPTZ '2026-05-05 10:00:00+01'
        ELSE NULL
    END
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 16. MANDAT_LIQUIDATIONS
-- ============================================================

INSERT INTO mandat_liquidations (mandat_id, liquidation_id, montant)
SELECT
    md5('demo-mandat-' || n)::uuid,
    md5('demo-liquidation-' || n)::uuid,
    ROUND((100000 + n * 10000) * 1.1925, 2)
FROM generate_series(1,50) n
ON CONFLICT (mandat_id, liquidation_id) DO NOTHING;

-- ============================================================
-- 17. PAIEMENTS
-- ============================================================

INSERT INTO paiements (
    id, collectivite_id, mandat_id, numero,
    mode_reglement, montant_ttc, montant_retenues,
    montant_net_paye, date_programmee, date_execution,
    statut, reference_bancaire, reference_cheque
)
SELECT
    md5('demo-paiement-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-mandat-' || n)::uuid,
    'PAY-DEMO-' || lpad(n::text, 3, '0'),
    CASE ((n - 1) % 3)
        WHEN 0 THEN 'CAISSE'::mode_reglement
        WHEN 1 THEN 'CHEQUE'::mode_reglement
        ELSE 'VIREMENT_BANCAIRE'::mode_reglement
    END,
    ROUND((100000 + n * 10000) * 1.1925, 2),
    ROUND((100000 + n * 10000) * 0.0925, 2),
    ROUND((100000 + n * 10000) * 1.10, 2),
    DATE '2026-06-01' + ((n - 1) % 20),
    CASE WHEN n % 4 <> 0 THEN DATE '2026-06-02' + ((n - 1) % 20) ELSE NULL END,
    CASE
        WHEN n % 10 = 0 THEN 'ECHEC'::statut_paiement
        WHEN n % 4 = 0 THEN 'EN_COURS'::statut_paiement
        ELSE 'EXECUTE'::statut_paiement
    END,
    CASE WHEN n % 3 <> 1 THEN 'VIR-DEMO-' || lpad(n::text,3,'0') ELSE NULL END,
    CASE WHEN n % 3 = 1 THEN 'CHQ-DEMO-' || lpad(n::text,3,'0') ELSE NULL END
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 18. REGIES
-- ============================================================

INSERT INTO regies (
    id, collectivite_id, exercice_id, code, libelle,
    type_regie, plafond, solde, nature_depenses,
    deliberation_reference, date_creation, statut, regisseur_id
)
SELECT
    md5('demo-regie-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-exercice-' || n)::uuid,
    'REG-DEMO-' || lpad(n::text,3,'0'),
    'Régie de démonstration ' || n,
    CASE WHEN n % 2 = 0 THEN 'RECETTES'::type_regie ELSE 'AVANCES'::type_regie END,
    500000 + n * 10000,
    480000 + n * 10000,
    '["FOURNITURES","PETITES_DEPENSES","SERVICES"]'::jsonb,
    'DEL-REG-DEMO-' || lpad(n::text,3,'0'),
    DATE '2026-01-15',
    CASE WHEN n % 17 = 0 THEN 'SUSPENDUE'::statut_regie ELSE 'ACTIVE'::statut_regie END,
    md5('demo-user-' || n)::uuid
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 19. DEPENSES_REGIE
-- ============================================================

INSERT INTO depenses_regie (
    id, collectivite_id, regie_id, reference,
    objet, montant, date_depense, justificatif_url,
    apuree, ordonnee
)
SELECT
    md5('demo-depense-regie-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-regie-' || n)::uuid,
    'DR-DEMO-' || lpad(n::text,3,'0'),
    'Dépense de régie courante de démonstration ' || n,
    20000 + (n * 500),
    DATE '2026-06-01' + ((n - 1) % 20),
    'https://minio.simba.test/demo/justificatif-' || n || '.pdf',
    n % 3 = 0,
    n % 4 = 0
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 20. REGIES_AVANCES
-- ============================================================

INSERT INTO regies_avances (
    id, numero_regie, date_creation, periodicite, regisseur_id,
    numero_deliberation, date_deliberation,
    date_approval_deliberation, montant_plafond,
    montant_total, montant_engages, montant_autorises,
    montant_ordonnances, montant_paye, solde_disponible,
    natures_autorisees, etat,
    montant_dernier_reconstitution, date_dernier_reconstitution,
    regie_cloture_exercice, date_cloture_exercice,
    solde_reversement, date_reversement_effectuee, date_modification
)
SELECT
    md5('demo-regie-avance-' || n)::uuid,
    'RAV-DEMO-' || lpad(n::text,3,'0'),
    DATE '2026-01-01',
    CASE WHEN n % 2 = 0 THEN 'SEMESTRIELLE' ELSE 'TRIMESTRIELLE' END,
    md5('demo-user-' || n)::uuid,
    'DEL-RAV-DEMO-' || lpad(n::text,3,'0'),
    DATE '2025-12-01',
    DATE '2025-12-15',
    500000 + n * 10000,
    500000 + n * 10000,
    10000 + n * 250,
    10000 + n * 250,
    CASE WHEN n % 4 = 0 THEN 10000 + n * 250 ELSE 0 END,
    CASE WHEN n % 10 = 0 THEN 10000 + n * 250 ELSE 0 END,
    (500000 + n * 10000) - (10000 + n * 250),
    'FOURNITURES, PETITES DEPENSES, SERVICES',
    CASE
        WHEN n % 15 = 0 THEN 'SUSPENDUE'
        WHEN n % 7 = 0 THEN 'EN_APUREMENT'
        ELSE 'ACTIVE'
    END,
    20000,
    DATE '2026-05-30',
    FALSE,
    NULL,
    NULL,
    NULL,
    CURRENT_TIMESTAMP
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 21. DEPENSES_REGIES
-- ============================================================

INSERT INTO depenses_regies (
    id, regie_avances_id, nature, montant,
    date_depense, description, url_justificatifs, etat
)
SELECT
    md5('demo-depenses-regies-' || n)::uuid,
    md5('demo-regie-avance-' || n)::uuid,
    CASE ((n - 1) % 4)
        WHEN 0 THEN 'FOURNITURES'
        WHEN 1 THEN 'TRANSPORT'
        WHEN 2 THEN 'ENTRETIEN'
        ELSE 'PETITES_DEPENSES'
    END,
    10000 + n * 250,
    DATE '2026-06-01' + ((n - 1) % 20),
    'Dépense sur régie d''avances de démonstration ' || n,
    'https://minio.simba.test/demo/regie/' || n || '.pdf',
    CASE
        WHEN n % 10 = 0 THEN 'PAYEE'
        WHEN n % 4 = 0 THEN 'ORDONNANCEE'
        WHEN n % 3 = 0 THEN 'AUTORISEE'
        ELSE 'SAISIE'
    END
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 22. APUREMENTS_REGIES
-- ============================================================

INSERT INTO apurements_regies (
    id, collectivite_id, regie_id, regieavances_id, date_periode, montant_soumis,
    controller_financier_visa_id, date_visa_cf, etat
)
SELECT
    md5('demo-apurement-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-regie-' || n)::uuid,
    md5('demo-regie-avance-' || n)::uuid,
    DATE '2026-06-30' + ((n - 1) % 5),
    10000 + n * 250,
    CASE
        WHEN n % 4 = 0 THEN md5('demo-user-' || n)::uuid
        ELSE NULL
    END,
    CASE WHEN n % 4 = 0 THEN TIMESTAMP '2026-07-05 10:00:00' ELSE NULL END,
    CASE
        WHEN n % 10 = 0 THEN 'PAYEE'
        WHEN n % 4 = 0 THEN 'VISEE_CF'
        WHEN n % 3 = 0 THEN 'ORDONNANCEE'
        ELSE 'EN_COURS'
    END
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 23. REGULARISATIONS_470XX
-- ============================================================

INSERT INTO regularisations_470xx (
    id, numero, collectivite_id, date_detection, reference_paiement_detecte,
    exercice_id, ligne_budgetaire_id, tiers_id, document_m5_id,
    engagement_id, montant_detecte, montant_imputation,
    nature_depense, "nature_dépense", description,
    receveur_id, receve_id, ordonnateur_id, ordonnator_id,
    controleur_financier_id, etat,
    comptabilisee_compte_470xx, numero_ecriture_comptable_470xx,
    date_notification_ordonnateur, ordonnateur_notifie, ordonnator_notifie,
    date_creation_engagement, date_visa_cf,
    liquidation_regularisation_id, mandat_regularisation_id,
    contrepassation_470xx_auto_effectuee, contrepassation470xxautoeffectuee,
    numero_ecriture_contrepassation, date_echeance_regularisation,
    alerte_j15_declenchee, alerte_j25_declenchee, alerte_critique,
    date_creation, motif_rejet_cf, inscrit_registre_anomalies,
    notification_tutelle_envoyee, date_modification
)
SELECT
    md5('demo-regularisation-' || n)::uuid,
    'REG-470XX-DEMO-' || lpad(n::text, 3, '0'),
    md5('demo-ctd-' || n)::uuid,
    TIMESTAMP '2026-06-01 08:00:00' + (n * INTERVAL '1 day'),
    'BANK-DEMO-' || lpad(n::text,3,'0'),
    md5('demo-exercice-' || n)::uuid,
    md5('demo-ligne-' || n)::uuid,
    md5('demo-tiers-' || n)::uuid,
    md5('demo-document-' || n)::uuid,
    md5('demo-engagement-' || n)::uuid,
    50000 + n * 1000,
    50000 + n * 1000,
    'Régularisation de dépense sans ordonnancement',
    'Régularisation de dépense sans ordonnancement',
    'Opération 470XX de démonstration ' || n,
    md5('demo-user-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    CASE WHEN n % 4 = 0 THEN md5('demo-user-' || n)::uuid ELSE NULL END,
    CASE
        WHEN n % 10 = 0 THEN 'DEPASSEMENT_DELAI'
        WHEN n % 5 = 0 THEN 'SOUMIS_CF'
        WHEN n % 3 = 0 THEN 'NOTIFIEE'
        ELSE 'DETECTEE'
    END,
    TRUE,
    'ECR-470XX-DEMO-' || lpad(n::text,3,'0'),
    CASE WHEN n % 3 <> 1 THEN TIMESTAMP '2026-06-03 10:00:00' ELSE NULL END,
    n % 3 <> 1,
    n % 3 <> 1,
    CASE WHEN n % 5 = 0 THEN TIMESTAMP '2026-06-10 10:00:00' ELSE NULL END,
    CASE WHEN n % 4 = 0 THEN TIMESTAMP '2026-06-15 10:00:00' ELSE NULL END,
    md5('demo-liquidation-' || n)::uuid,
    CASE WHEN n % 10 <> 0 THEN md5('demo-mandat-' || n)::uuid ELSE NULL END,
    n % 10 <> 0,
    n % 10 <> 0,
    CASE WHEN n % 10 <> 0 THEN 'ECR-470XX-CONTREPASS-' || lpad(n::text,3,'0') ELSE NULL END,
    CASE WHEN n % 10 = 0 THEN DATE '2026-06-01' ELSE DATE '2026-12-31' END,
    n % 3 = 0,
    n % 5 = 0,
    n % 10 = 0,
    TIMESTAMP '2026-06-01 08:00:00' + (n * INTERVAL '1 day'),
    CASE WHEN n % 10 = 0 THEN 'Délai réglementaire dépassé' ELSE NULL END,
    n % 10 = 0,
    n % 10 = 0,
    TIMESTAMP '2026-06-01 08:00:00' + (n * INTERVAL '1 day')
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 24. NOTIFICATIONS
-- ============================================================

INSERT INTO notifications (
    id, collectivite_id, utilisateur_id, titre,
    message, niveau, lu, date_lecture, lien, metadata
)
SELECT
    md5('demo-notification-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    CASE
        WHEN n % 10 = 0 THEN 'Alerte budgétaire'
        WHEN n % 5 = 0 THEN 'Action requise'
        ELSE 'Information de démonstration'
    END || ' #' || n,
    'Événement de démonstration pour le reporting et le suivi du workflow.',
    CASE
        WHEN n % 10 = 0 THEN 'CRITIQUE'::niveau_notification
        WHEN n % 5 = 0 THEN 'AVERTISSEMENT'::niveau_notification
        ELSE 'INFO'::niveau_notification
    END,
    n % 3 = 0,
    CASE WHEN n % 3 = 0 THEN TIMESTAMPTZ '2026-06-15 10:00:00+01' ELSE NULL END,
    '/dashboard/reporting',
    jsonb_build_object('source','DEMO','numero',n)
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 25. JOURNAL AUDIT
-- ============================================================

INSERT INTO journal_audit (
    id, collectivite_id, utilisateur_id, action,
    table_concernee, identifiant_enregistrement,
    ancienne_valeur, nouvelle_valeur, adresse_ip,
    user_agent, date_action
)
SELECT
    md5('demo-audit-' || n)::uuid,
    md5('demo-ctd-' || n)::uuid,
    md5('demo-user-' || n)::uuid,
    CASE
        WHEN n % 4 = 0 THEN 'SOUMISSION'
        WHEN n % 4 = 1 THEN 'CREATION'
        WHEN n % 4 = 2 THEN 'VALIDATION'
        ELSE 'CONSULTATION'
    END,
    CASE
        WHEN n % 4 = 0 THEN 'engagements'
        WHEN n % 4 = 1 THEN 'documents_preparatoires'
        WHEN n % 4 = 2 THEN 'mandats'
        ELSE 'paiements'
    END,
    CASE
        WHEN n % 4 = 0 THEN md5('demo-engagement-' || n)::uuid
        WHEN n % 4 = 1 THEN md5('demo-document-' || n)::uuid
        WHEN n % 4 = 2 THEN md5('demo-mandat-' || n)::uuid
        ELSE md5('demo-paiement-' || n)::uuid
    END,
    NULL,
    jsonb_build_object('source','DEMO','numero',n,'simulation',true),
    ('192.168.10.' || ((n - 1) % 50 + 1))::inet,
    'Simba_CTD-Demo/1.0',
    TIMESTAMPTZ '2026-06-20 08:00:00+01' + (n * INTERVAL '1 hour')
FROM generate_series(1,50) n
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 26. VERIFICATION DU SEED
-- ============================================================

SELECT 'collectivites' AS table_name, COUNT(*) AS total
FROM collectivites
WHERE id IN (SELECT md5('demo-ctd-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'configurations_visuelles' AS table_name, COUNT(*) AS total
FROM configurations_visuelles
WHERE id IN (SELECT md5('demo-config-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'parametres_reglementaires' AS table_name, COUNT(*) AS total
FROM parametres_reglementaires
WHERE id IN (SELECT md5('demo-param-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'menus' AS table_name, COUNT(*) AS total
FROM menus
WHERE id IN (SELECT md5('demo-menu-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'fonctionnalites_collectivites' AS table_name, COUNT(*) AS total
FROM fonctionnalites_collectivites
WHERE id IN (SELECT md5('demo-feature-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'utilisateurs' AS table_name, COUNT(*) AS total
FROM utilisateurs
WHERE id IN (SELECT md5('demo-user-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'tiers' AS table_name, COUNT(*) AS total
FROM tiers
WHERE id IN (SELECT md5('demo-tiers-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'exercices_budgetaires' AS table_name, COUNT(*) AS total
FROM exercices_budgetaires
WHERE id IN (SELECT md5('demo-exercice-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'budgets' AS table_name, COUNT(*) AS total
FROM budgets
WHERE id IN (SELECT md5('demo-budget-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'lignes_budgetaires' AS table_name, COUNT(*) AS total
FROM lignes_budgetaires
WHERE id IN (SELECT md5('demo-ligne-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'documents_preparatoires' AS table_name, COUNT(*) AS total
FROM documents_preparatoires
WHERE id IN (SELECT md5('demo-document-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'engagements' AS table_name, COUNT(*) AS total
FROM engagements
WHERE id IN (SELECT md5('demo-engagement-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'avis_controle_financier' AS table_name, COUNT(*) AS total
FROM avis_controle_financier
WHERE id IN (SELECT md5('demo-avis-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'liquidations' AS table_name, COUNT(*) AS total
FROM liquidations
WHERE id IN (SELECT md5('demo-liquidation-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'mandats' AS table_name, COUNT(*) AS total
FROM mandats
WHERE id IN (SELECT md5('demo-mandat-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'mandat_liquidations' AS table_name, COUNT(*) AS total
FROM mandat_liquidations
WHERE mandat_id IN (SELECT md5('demo-mandat-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'paiements' AS table_name, COUNT(*) AS total
FROM paiements
WHERE id IN (SELECT md5('demo-paiement-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'regies' AS table_name, COUNT(*) AS total
FROM regies
WHERE id IN (SELECT md5('demo-regie-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'depenses_regie' AS table_name, COUNT(*) AS total
FROM depenses_regie
WHERE id IN (SELECT md5('demo-depense-regie-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'regies_avances' AS table_name, COUNT(*) AS total
FROM regies_avances
WHERE id IN (SELECT md5('demo-regie-avance-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'depenses_regies' AS table_name, COUNT(*) AS total
FROM depenses_regies
WHERE id IN (SELECT md5('demo-depenses-regies-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'apurements_regies' AS table_name, COUNT(*) AS total
FROM apurements_regies
WHERE id IN (SELECT md5('demo-apurement-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'regularisations_470xx' AS table_name, COUNT(*) AS total
FROM regularisations_470xx
WHERE id IN (SELECT md5('demo-regularisation-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'notifications' AS table_name, COUNT(*) AS total
FROM notifications
WHERE id IN (SELECT md5('demo-notification-' || n)::uuid FROM generate_series(1,50) n);

SELECT 'journal_audit' AS table_name, COUNT(*) AS total
FROM journal_audit
WHERE id IN (SELECT md5('demo-audit-' || n)::uuid FROM generate_series(1,50) n);

COMMIT;
