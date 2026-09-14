BEGIN;
-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
ALTER TABLE engagements
    ALTER COLUMN statut DROP DEFAULT;

CREATE TYPE statut_engagement_v20 AS ENUM (
    'BROUILLON',
    'SOUMIS_CF',
    'VISE',
    'REJET',
    'CONFIRME',
    'CLOTURE_30_NOV'
);

ALTER TABLE engagements
    ALTER COLUMN statut TYPE statut_engagement_v20
    USING (
        CASE statut::text
            WHEN 'BROUILLON' THEN 'BROUILLON'
            WHEN 'SOUMIS_CF' THEN 'SOUMIS_CF'
            WHEN 'VISA' THEN 'VISE'
            WHEN 'VISA_OBSERVATIONS' THEN 'VISE'
            WHEN 'VISA_RESERVES' THEN 'VISE'
            WHEN 'REJETE' THEN 'REJET'
            WHEN 'CONFIRME' THEN 'CONFIRME'
            WHEN 'ANNULE' THEN 'REJET'
            WHEN 'CLOTURE' THEN 'CLOTURE_30_NOV'
            ELSE 'BROUILLON'
        END
    )::statut_engagement_v20;

DROP TYPE statut_engagement;

ALTER TYPE statut_engagement_v20
    RENAME TO statut_engagement;

ALTER TABLE engagements
    ALTER COLUMN statut SET DEFAULT 'BROUILLON';


-- ============================================================
-- 4. ALIGNEMENT DES COLONNES DE engagements
-- ============================================================

UPDATE engagements
SET numero = numero_engagement
WHERE numero IS NULL
  AND numero_engagement IS NOT NULL;


-- ------------------------------------------------------------
-- 4.2 montant_ht
-- ------------------------------------------------------------

UPDATE engagements
SET montant_ht = montantht
WHERE montantht IS NOT NULL
  AND (
      montant_ht = 0
      OR montant_ht IS NULL
  );


-- ------------------------------------------------------------
-- 4.3 montant_ttc
-- ------------------------------------------------------------

UPDATE engagements
SET montant_ttc = montantttc
WHERE montantttc IS NOT NULL
  AND (
      montant_ttc = 0
      OR montant_ttc IS NULL
  );


-- ------------------------------------------------------------
-- 4.4 montant_taxes
-- ------------------------------------------------------------

UPDATE engagements
SET montant_taxes = montanttva
WHERE montanttva IS NOT NULL
  AND (
      montant_taxes = 0
      OR montant_taxes IS NULL
  );


-- ------------------------------------------------------------
-- 4.5 ligne_budgetaire_id
-- ------------------------------------------------------------

UPDATE engagements
SET ligne_budgetaire_id = lignebudgetaire_id
WHERE lignebudgetaire_id IS NOT NULL
  AND ligne_budgetaire_id IS NULL;


-- ------------------------------------------------------------
-- 4.6 utilisateur_createur_id
-- ------------------------------------------------------------

UPDATE engagements
SET utilisateur_createur_id = ordonnator_id
WHERE ordonnator_id IS NOT NULL
  AND utilisateur_createur_id IS NULL;


-- ------------------------------------------------------------
-- 4.7 date_creation
-- ------------------------------------------------------------

UPDATE engagements
SET date_creation = created_at
WHERE date_creation IS NULL;


-- ------------------------------------------------------------
-- 4.8 date_visa
-- ------------------------------------------------------------

UPDATE engagements
SET date_visa = vise_cf_at
WHERE date_visa IS NULL
  AND vise_cf_at IS NOT NULL;


UPDATE engagements
SET document_preparatoire_id = documentm5id
WHERE document_preparatoire_id IS NULL
  AND documentm5id IS NOT NULL;


-- ------------------------------------------------------------
-- 4.10 crédits réservés
-- ------------------------------------------------------------

UPDATE engagements
SET credits_reserves = FALSE
WHERE credits_reserves IS NULL;


-- ------------------------------------------------------------
-- 4.11 Ajouter les colonnes métier nécessaires
-- ------------------------------------------------------------

ALTER TABLE engagements
    ADD COLUMN IF NOT EXISTS taux_tva NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS taux_impot NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS montant_impot NUMERIC(19,2),
    ADD COLUMN IF NOT EXISTS contrat_service_id UUID,
    ADD COLUMN IF NOT EXISTS controller_financier_visa_id UUID,
    ADD COLUMN IF NOT EXISTS credits_reserves BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS date_creation TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS date_visa TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS depassement_credit_autorise BOOLEAN,
    ADD COLUMN IF NOT EXISTS periodicite VARCHAR(255),
    ADD COLUMN IF NOT EXISTS ordonnator_id UUID;


-- ------------------------------------------------------------
-- 4.12 Synchronisation des anciennes colonnes
-- ------------------------------------------------------------

UPDATE engagements
SET taux_tva = CASE
    WHEN montant_ht > 0
        THEN ROUND((montant_taxes / montant_ht) * 100, 4)
    ELSE 0
END
WHERE taux_tva IS NULL;

UPDATE engagements
SET montant_impot = COALESCE(montant_impot, 0);

UPDATE engagements
SET taux_impot = COALESCE(taux_impot, 0);

UPDATE engagements
SET ordonnator_id = utilisateur_createur_id
WHERE ordonnator_id IS NULL
  AND utilisateur_createur_id IS NOT NULL;

UPDATE engagements
SET date_creation = COALESCE(date_creation, created_at);

UPDATE engagements
SET controller_financier_visa_id = controller_financier_visa_id;


-- ------------------------------------------------------------
-- 4.13 Supprimer les colonnes historiques redondantes
-- ------------------------------------------------------------

-- Les colonnes historiques sont conservées afin de ne pas détruire les
-- données d'installations existantes. Elles pourront être retirées dans une
-- migration dédiée après sauvegarde et validation fonctionnelle.


-- ============================================================
-- 5. AJOUT DES FK engagements
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_engagement_contrat_service'
    ) THEN
        ALTER TABLE engagements
            ADD CONSTRAINT fk_engagement_contrat_service
            FOREIGN KEY (contrat_service_id)
            REFERENCES documents_preparatoires(id)
            ON DELETE SET NULL;
    END IF;

END $$;


-- ============================================================
-- 6. ALIGNEMENT statut_liquidation
-- ============================================================
ALTER TABLE liquidations
    ALTER COLUMN statut DROP DEFAULT;

CREATE TYPE statut_liquidation_v20 AS ENUM (
    'BROUILLON',
    'SOUMISE_CF',
    'VALIDEE_CF',
    'REJETEE',
    'PRETE_ORDONNANCEMENT'
);

ALTER TABLE liquidations
    ALTER COLUMN statut TYPE statut_liquidation_v20
    USING (
        CASE statut::text
            WHEN 'BROUILLON'
                THEN 'BROUILLON'

            WHEN 'SOUMISE'
                THEN 'SOUMISE_CF'

            WHEN 'VALIDEE'
                THEN 'VALIDEE_CF'

            WHEN 'REJETEE'
                THEN 'REJETEE'

            WHEN 'ANNULEE'
                THEN 'REJETEE'

            ELSE 'BROUILLON'
        END
    )::statut_liquidation_v20;

DROP TYPE statut_liquidation;

ALTER TYPE statut_liquidation_v20
    RENAME TO statut_liquidation;

ALTER TABLE liquidations
    ALTER COLUMN statut SET DEFAULT 'BROUILLON';


-- ============================================================
-- 7. CONSOLIDATION DES COLONNES liquidations
-- ============================================================

-- montant HT
UPDATE liquidations
SET montant_ht = montanthtliquide
WHERE montanthtliquide IS NOT NULL
  AND (
      montant_ht = 0
      OR montant_ht IS NULL
  );


-- montant TVA
UPDATE liquidations
SET montant_taxes = montanttvaliquide
WHERE montanttvaliquide IS NOT NULL
  AND (
      montant_taxes = 0
      OR montant_taxes IS NULL
  );


-- montant TTC
UPDATE liquidations
SET montant_ttc = montantttcliquide
WHERE montantttcliquide IS NOT NULL
  AND (
      montant_ttc = 0
      OR montant_ttc IS NULL
  );


-- montant NAP
UPDATE liquidations
SET montant_nap = montantnap
WHERE montantnap IS NOT NULL
  AND montant_nap IS NULL;


-- conformité fiscale
UPDATE liquidations
SET conformite_fiscale = attestation_fiscale_presente
WHERE attestation_fiscale_presente IS NOT NULL;


-- service fait
UPDATE liquidations
SET service_fait_at = date_atestation_service_fait
WHERE service_fait_at IS NULL
  AND date_atestation_service_fait IS NOT NULL;


-- date création
UPDATE liquidations
SET date_creation = created_at
WHERE date_creation IS NULL;


-- ------------------------------------------------------------
-- 7.1 Colonnes métier
-- ------------------------------------------------------------

ALTER TABLE liquidations
    ALTER COLUMN montant_ht SET DEFAULT 0,
    ALTER COLUMN montant_taxes SET DEFAULT 0,
    ALTER COLUMN montant_ttc SET DEFAULT 0;

ALTER TABLE liquidations
    ADD COLUMN IF NOT EXISTS taux_tva NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS taux_impot_retenue NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS montant_impot_retenue NUMERIC(19,2),
    ADD COLUMN IF NOT EXISTS detail_prestations TEXT,
    ADD COLUMN IF NOT EXISTS agent_service_fait_id UUID,
    ADD COLUMN IF NOT EXISTS url_attestation_fiscale TEXT,
    ADD COLUMN IF NOT EXISTS url_facture TEXT,
    ADD COLUMN IF NOT EXISTS date_validation TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ordonnator_id UUID,
    ADD COLUMN IF NOT EXISTS controller_financier_validation_id UUID,
    ADD COLUMN IF NOT EXISTS numero_liquidation_originale VARCHAR(100),
    ADD COLUMN IF NOT EXISTS ecart_regularise NUMERIC(19,2),
    ADD COLUMN IF NOT EXISTS date_creation TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;


-- ------------------------------------------------------------
-- 7.2 Synchronisation service fait
-- ------------------------------------------------------------

UPDATE liquidations
SET service_fait_at = COALESCE(
    service_fait_at,
    date_atestation_service_fait
);

-- Si l'ancien booléen indique que le service fait était attesté
-- mais qu'aucune date n'existe, nous ne fabriquons pas de date.
-- La présence de service_fait_at reste la donnée canonique.


-- ------------------------------------------------------------
-- 7.3 Suppression des doublons
-- ------------------------------------------------------------

ALTER TABLE liquidations
    DROP COLUMN IF EXISTS montanthtliquide,
    DROP COLUMN IF EXISTS montanttvaliquide,
    DROP COLUMN IF EXISTS montantttcliquide,
    DROP COLUMN IF EXISTS montantnap,
    DROP COLUMN IF EXISTS service_fait_ateste,
    DROP COLUMN IF EXISTS attestation_fiscale_presente,
    DROP COLUMN IF EXISTS date_atestation_service_fait,
    DROP COLUMN IF EXISTS etat;


-- ============================================================
-- 8. FK liquidations
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_liquidation_agent_service_fait'
    ) THEN
        ALTER TABLE liquidations
            ADD CONSTRAINT fk_liquidation_agent_service_fait
            FOREIGN KEY (agent_service_fait_id)
            REFERENCES utilisateurs(id);
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_liquidation_ordonnateur'
    ) THEN
        ALTER TABLE liquidations
            ADD CONSTRAINT fk_liquidation_ordonnateur
            FOREIGN KEY (ordonnator_id)
            REFERENCES utilisateurs(id);
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_liquidation_controleur'
    ) THEN
        ALTER TABLE liquidations
            ADD CONSTRAINT fk_liquidation_controleur
            FOREIGN KEY (controller_financier_validation_id)
            REFERENCES utilisateurs(id);
    END IF;

END $$;


-- ============================================================
-- 9. ALIGNEMENT type_mandat
-- ============================================================
ALTER TABLE mandats
    ALTER COLUMN type_mandat DROP DEFAULT;

CREATE TYPE type_mandat_v20 AS ENUM (
    'INDIVIDUEL',
    'COLLECTIF',
    'REGULARISATION',
    'RETENUE_GARANTIE',
    'REGLEMENT_OFFICE'
);

ALTER TABLE mandats
    ALTER COLUMN type_mandat TYPE type_mandat_v20
    USING (
        CASE type_mandat::text
            WHEN 'INDIVIDUEL'
                THEN 'INDIVIDUEL'

            WHEN 'COLLECTIF'
                THEN 'COLLECTIF'

            WHEN 'REGULARISATION_REGIE'
                THEN 'REGULARISATION'

            WHEN 'RETENUE_GARANTIE'
                THEN 'RETENUE_GARANTIE'

            WHEN 'REGLEMENT_OFFICE'
                THEN 'REGLEMENT_OFFICE'

            ELSE 'INDIVIDUEL'
        END
    )::type_mandat_v20;

DROP TYPE type_mandat;

ALTER TYPE type_mandat_v20
    RENAME TO type_mandat;

ALTER TABLE mandats
    ALTER COLUMN type_mandat SET DEFAULT 'INDIVIDUEL';


-- ============================================================
-- 10. ALIGNEMENT statut_mandat
-- ============================================================

ALTER TABLE mandats
    ALTER COLUMN statut DROP DEFAULT;

CREATE TYPE statut_mandat_v20 AS ENUM (
    'BROUILLON',
    'SOUMIS_CF',
    'VISE_CF',
    'REJETE_CF',
    'TRANSMIS_RECEVEUR',
    'PAYE',
    'ANNULE'
);

ALTER TABLE mandats
    ALTER COLUMN statut TYPE statut_mandat_v20
    USING (
        CASE statut::text

            WHEN 'BROUILLON'
                THEN 'BROUILLON'

            WHEN 'SOUMIS_CF'
                THEN 'SOUMIS_CF'

            WHEN 'DEPENSE_VALIDEE'
                THEN 'VISE_CF'

            WHEN 'VISE_CF'
                THEN 'VISE_CF'

            WHEN 'REJETE'
                THEN 'REJETE_CF'

            WHEN 'REJETE_CF'
                THEN 'REJETE_CF'

            WHEN 'TRANSMIS_RECEVEUR'
                THEN 'TRANSMIS_RECEVEUR'

            WHEN 'PRIS_EN_CHARGE'
                THEN 'TRANSMIS_RECEVEUR'

            WHEN 'PAYE'
                THEN 'PAYE'

            WHEN 'ANNULE'
                THEN 'ANNULE'

            ELSE 'BROUILLON'

        END
    )::statut_mandat_v20;

DROP TYPE statut_mandat;

ALTER TYPE statut_mandat_v20
    RENAME TO statut_mandat;

ALTER TABLE mandats
    ALTER COLUMN statut SET DEFAULT 'BROUILLON';


-- ============================================================
-- 11. CONSOLIDATION mandats
-- ============================================================

UPDATE mandats
SET numero = numero_mandat
WHERE numero_mandat IS NOT NULL
  AND numero IS NULL;


-- ------------------------------------------------------------
-- ordonnateur
-- ------------------------------------------------------------

UPDATE mandats
SET ordonnateur_id = ordonnator_id
WHERE ordonnator_id IS NOT NULL
  AND ordonnateur_id IS NULL;


-- ------------------------------------------------------------
-- receveur
-- ------------------------------------------------------------

UPDATE mandats
SET receveur_id = receve_id
WHERE receve_id IS NOT NULL
  AND receveur_id IS NULL;


-- ------------------------------------------------------------
-- montant
-- ------------------------------------------------------------

UPDATE mandats
SET montant_total = montantttcmandate
WHERE montantttcmandate IS NOT NULL
  AND (
      montant_total = 0
      OR montant_total IS NULL
  );


-- ------------------------------------------------------------
-- date mandatement
-- ------------------------------------------------------------

UPDATE mandats
SET date_mandatement = date_mandat::date
WHERE date_mandat IS NOT NULL;


-- ------------------------------------------------------------
-- date création
-- ------------------------------------------------------------

UPDATE mandats
SET created_at = date_creation
WHERE date_creation IS NOT NULL;


-- ------------------------------------------------------------
-- contrôle financier
-- ------------------------------------------------------------

UPDATE mandats
SET controleur_id = controller_financier_visa_id
WHERE controleur_id IS NULL
  AND controller_financier_visa_id IS NOT NULL;


-- ------------------------------------------------------------
-- dépense validée
-- ------------------------------------------------------------

UPDATE mandats
SET depense_validee_at =
    COALESCE(depense_validee_at, date_valicf)
WHERE date_valicf IS NOT NULL;


-- ------------------------------------------------------------
-- Suppression des doublons
-- ------------------------------------------------------------

ALTER TABLE mandats
    DROP COLUMN IF EXISTS controller_financier_visa_id,
    DROP COLUMN IF EXISTS cosignataider_id,
    DROP COLUMN IF EXISTS date_creation,
    DROP COLUMN IF EXISTS date_mandat,
    DROP COLUMN IF EXISTS date_paiement,
    DROP COLUMN IF EXISTS date_soumissioncf,
    DROP COLUMN IF EXISTS date_transmission_receveur,
    DROP COLUMN IF EXISTS date_valicf,
    DROP COLUMN IF EXISTS depense_validee_signal,
    DROP COLUMN IF EXISTS etat,
    DROP COLUMN IF EXISTS etat_paiement,
    DROP COLUMN IF EXISTS mode_paiement,
    DROP COLUMN IF EXISTS montantnap,
    DROP COLUMN IF EXISTS montant_retenu_source,
    DROP COLUMN IF EXISTS montantttcmandate,
    DROP COLUMN IF EXISTS numero_check_paiement,
    DROP COLUMN IF EXISTS numero_mandat,
    DROP COLUMN IF EXISTS ordonnator_id,
    DROP COLUMN IF EXISTS periode_versement,
    DROP COLUMN IF EXISTS receve_id,
    DROP COLUMN IF EXISTS url_bordereau_mandats,
    DROP COLUMN IF EXISTS url_liasse_documents,
    DROP COLUMN IF EXISTS engagement_id;


-- ============================================================
-- 12. ALIGNEMENT mode_reglement
-- ============================================================

ALTER TABLE paiements
    ALTER COLUMN mode_reglement DROP DEFAULT;

CREATE TYPE mode_reglement_v20 AS ENUM (
    'CAISSE',
    'CHEQUE',
    'VIREMENT_BANCAIRE'
);

ALTER TABLE paiements
    ALTER COLUMN mode_reglement TYPE mode_reglement_v20
    USING (
        CASE mode_reglement::text

            WHEN 'CAISSE'
                THEN 'CAISSE'

            WHEN 'CHEQUE'
                THEN 'CHEQUE'

            WHEN 'VIREMENT'
                THEN 'VIREMENT_BANCAIRE'

            WHEN 'VIREMENT_GROUPE'
                THEN 'VIREMENT_BANCAIRE'

            ELSE 'CAISSE'

        END
    )::mode_reglement_v20;

DROP TYPE mode_reglement;

ALTER TYPE mode_reglement_v20
    RENAME TO mode_reglement;


-- ============================================================
-- 13. ALIGNEMENT statut_paiement
-- ============================================================

-- La vue dépend de paiements.statut et doit être supprimée avant
-- la conversion du type enum de cette colonne.
DROP VIEW IF EXISTS v_alertes_paiements;

ALTER TABLE paiements
    ALTER COLUMN statut DROP DEFAULT;

CREATE TYPE statut_paiement_v20 AS ENUM (
    'PROGRAMME',
    'EN_COURS',
    'EXECUTE',
    'ECHEC'
);

ALTER TABLE paiements
    ALTER COLUMN statut TYPE statut_paiement_v20
    USING (
        CASE statut::text

            WHEN 'PROGRAMME'
                THEN 'PROGRAMME'

            WHEN 'EN_ATTENTE'
                THEN 'EN_COURS'

            WHEN 'EXECUTE'
                THEN 'EXECUTE'

            WHEN 'DIFFERE'
                THEN 'EN_COURS'

            WHEN 'REJETE'
                THEN 'ECHEC'

            WHEN 'ANNULE'
                THEN 'ECHEC'

            ELSE 'PROGRAMME'

        END
    )::statut_paiement_v20;

DROP TYPE statut_paiement;

ALTER TYPE statut_paiement_v20
    RENAME TO statut_paiement;

ALTER TABLE paiements
    ALTER COLUMN statut SET DEFAULT 'PROGRAMME';


-- ============================================================
-- 14. CONSOLIDATION paiements
-- ============================================================

UPDATE paiements
SET montant_ttc = montantttcpaye
WHERE montantttcpaye IS NOT NULL
  AND (
      montant_ttc = 0
      OR montant_ttc IS NULL
  );


-- ------------------------------------------------------------
-- NAP
-- ------------------------------------------------------------

UPDATE paiements
SET montant_net_paye = montantnapverse
WHERE montantnapverse IS NOT NULL
  AND montant_net_paye IS NULL;


-- ------------------------------------------------------------
-- date programmation
-- ------------------------------------------------------------

UPDATE paiements
SET date_programmee =
    date_programmation_paiement::date
WHERE date_programmation_paiement IS NOT NULL
  AND date_programmee IS NULL;


-- ------------------------------------------------------------
-- date exécution
-- ------------------------------------------------------------

UPDATE paiements
SET date_execution = date_paiement::date
WHERE date_paiement IS NOT NULL
  AND date_execution IS NULL;


-- ------------------------------------------------------------
-- référence chèque
-- ------------------------------------------------------------

UPDATE paiements
SET reference_cheque = numero_cheque
WHERE reference_cheque IS NULL
  AND numero_cheque IS NOT NULL;


-- ------------------------------------------------------------
-- suppression des doublons
-- ------------------------------------------------------------

ALTER TABLE paiements
    DROP COLUMN IF EXISTS cachet_vu_bonapayer,
    DROP COLUMN IF EXISTS cosignataider_id,
    DROP COLUMN IF EXISTS date_apposition_cachet,
    DROP COLUMN IF EXISTS date_creation,
    DROP COLUMN IF EXISTS date_paiement,
    DROP COLUMN IF EXISTS date_programmation_paiement,
    DROP COLUMN IF EXISTS date_reception_mandat,
    DROP COLUMN IF EXISTS date_signature_cosignataire,
    DROP COLUMN IF EXISTS date_signature_receveur,
    DROP COLUMN IF EXISTS disponibilites_banque,
    DROP COLUMN IF EXISTS disponibilites_caisse,
    DROP COLUMN IF EXISTS disponibilites_suffisantes,
    DROP COLUMN IF EXISTS etat,
    DROP COLUMN IF EXISTS justification_differement,
    DROP COLUMN IF EXISTS montantnapverse,
    DROP COLUMN IF EXISTS montant_retenu_source,
    DROP COLUMN IF EXISTS montantttcpaye,
    DROP COLUMN IF EXISTS motif_echec,
    DROP COLUMN IF EXISTS numero_cheque,
    DROP COLUMN IF EXISTS oppositions_verifiees,
    DROP COLUMN IF EXISTS ordre_virement_genere,
    DROP COLUMN IF EXISTS prescription_verifiee,
    DROP COLUMN IF EXISTS receve_id,
    DROP COLUMN IF EXISTS redevabilite_verifiee,
    DROP COLUMN IF EXISTS signature_cosignatire_effectuee,
    DROP COLUMN IF EXISTS signature_receve_effectuee,
    DROP COLUMN IF EXISTS validit_creance_verifiee;


-- ============================================================
-- 15. CONTRAINTES paiements
-- ============================================================

ALTER TABLE paiements
    ADD CONSTRAINT ck_paiement_montant_ttc_positif
    CHECK (montant_ttc > 0);

ALTER TABLE paiements
    ADD CONSTRAINT ck_paiement_retenues_valides
    CHECK (
        montant_retenues >= 0
        AND montant_retenues <= montant_ttc
    );

ALTER TABLE paiements
    ADD CONSTRAINT ck_paiement_net_valide
    CHECK (
        montant_net_paye >= 0
        AND montant_net_paye <= montant_ttc
    );


-- ============================================================
-- 16. SUPPRESSION DE L'ANCIENNE TABLE ligne_mandat
-- ============================================================

DROP TABLE IF EXISTS ligne_mandat;


-- ============================================================
-- 17. CONSOLIDATION mandat_liquidations
-- ============================================================

ALTER TABLE mandat_liquidations
    ADD COLUMN IF NOT EXISTS montant NUMERIC(19,2);

ALTER TABLE mandat_liquidations
    ALTER COLUMN montant SET NOT NULL;


-- ============================================================
-- 18. CONTRAINTES métier mandat/liquidation
-- ============================================================

ALTER TABLE mandat_liquidations
    ADD CONSTRAINT ck_mandat_liquidation_montant_positif
    CHECK (montant > 0);


-- ============================================================
-- 19. INDEX métier
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_engagements_collectivite_statut
    ON engagements(collectivite_id, statut);

CREATE INDEX IF NOT EXISTS idx_engagements_collectivite_exercice
    ON engagements(collectivite_id, exercice_id);

CREATE INDEX IF NOT EXISTS idx_engagements_ordonnateur
    ON engagements(collectivite_id, utilisateur_createur_id);

CREATE INDEX IF NOT EXISTS idx_liquidations_collectivite_statut
    ON liquidations(collectivite_id, statut);

CREATE INDEX IF NOT EXISTS idx_liquidations_engagement
    ON liquidations(collectivite_id, engagement_id);

CREATE INDEX IF NOT EXISTS idx_mandats_collectivite_statut
    ON mandats(collectivite_id, statut);

CREATE INDEX IF NOT EXISTS idx_mandats_exercice
    ON mandats(collectivite_id, exercice_id);

CREATE INDEX IF NOT EXISTS idx_mandat_liquidations_liquidation
    ON mandat_liquidations(liquidation_id);

CREATE INDEX IF NOT EXISTS idx_paiements_collectivite_statut
    ON paiements(collectivite_id, statut);

CREATE INDEX IF NOT EXISTS idx_paiements_mandat
    ON paiements(collectivite_id, mandat_id);


-- ============================================================
-- 20. CONTRAINTE DE COHERENCE TENANT
-- ============================================================
-- 21. CORRECTION DE LA VUE DES PAIEMENTS

DROP VIEW IF EXISTS v_alertes_paiements;

CREATE OR REPLACE VIEW v_alertes_paiements AS
SELECT
    p.id,
    p.collectivite_id,
    m.numero AS numero_mandat,
    m.montant_total,
    p.montant_ttc,
    p.montant_net_paye,
    p.statut,
    p.date_programmee
FROM paiements p
JOIN mandats m
    ON m.id = p.mandat_id
   AND m.collectivite_id = p.collectivite_id
WHERE p.statut <> 'EXECUTE';


-- ============================================================
-- 22. CONTRAINTES SUPPLEMENTAIRES
-- ============================================================

ALTER TABLE engagements
    ADD CONSTRAINT ck_engagement_montants
    CHECK (
        montant_ht >= 0
        AND montant_taxes >= 0
        AND montant_ttc >= 0
        AND montant_engage >= 0
    );

ALTER TABLE liquidations
    ADD CONSTRAINT ck_liquidation_montants
    CHECK (
        montant_ht >= 0
        AND montant_taxes >= 0
        AND montant_ttc >= 0
    );

ALTER TABLE mandats
    ADD CONSTRAINT ck_mandat_montant_total
    CHECK (montant_total >= 0);


-- ============================================================
-- 23. TRIGGER updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION maj_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Engagements
DROP TRIGGER IF EXISTS trg_engagements_updated_at
ON engagements;

CREATE TRIGGER trg_engagements_updated_at
BEFORE UPDATE ON engagements
FOR EACH ROW
EXECUTE FUNCTION maj_updated_at();


-- Liquidations
DROP TRIGGER IF EXISTS trg_liquidations_updated_at
ON liquidations;

CREATE TRIGGER trg_liquidations_updated_at
BEFORE UPDATE ON liquidations
FOR EACH ROW
EXECUTE FUNCTION maj_updated_at();


-- Mandats
DROP TRIGGER IF EXISTS trg_mandats_updated_at
ON mandats;

CREATE TRIGGER trg_mandats_updated_at
BEFORE UPDATE ON mandats
FOR EACH ROW
EXECUTE FUNCTION maj_updated_at();


-- Paiements
DROP TRIGGER IF EXISTS trg_paiements_updated_at
ON paiements;

CREATE TRIGGER trg_paiements_updated_at
BEFORE UPDATE ON paiements
FOR EACH ROW
EXECUTE FUNCTION maj_updated_at();


-- ============================================================
-- 24. TRIGGER : MONTANT NET PAIEMENT
-- ============================================================

CREATE OR REPLACE FUNCTION calculer_montant_net_paiement()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.montant_retenues IS NULL THEN
        NEW.montant_retenues := 0;
    END IF;

    IF NEW.montant_ttc IS NULL THEN
        RAISE EXCEPTION
            'Le montant TTC du paiement est obligatoire';
    END IF;

    NEW.montant_net_paye :=
        NEW.montant_ttc - NEW.montant_retenues;

    IF NEW.montant_net_paye < 0 THEN
        RAISE EXCEPTION
            'Les retenues ne peuvent pas dépasser le montant TTC';
    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_calcul_montant_net_paiement
ON paiements;

CREATE TRIGGER trg_calcul_montant_net_paiement
BEFORE INSERT OR UPDATE
ON paiements
FOR EACH ROW
EXECUTE FUNCTION calculer_montant_net_paiement();


-- ============================================================
-- 25. TRIGGER : UNICITE D'UNE LIQUIDATION DANS UN MANDAT
-- ============================================================

CREATE OR REPLACE FUNCTION verifier_liquidation_unique_mandat()
RETURNS TRIGGER AS $$
DECLARE
    autre_mandat UUID;
BEGIN

    SELECT mandat_id
    INTO autre_mandat
    FROM mandat_liquidations
    WHERE liquidation_id = NEW.liquidation_id
      AND mandat_id <> NEW.mandat_id
    LIMIT 1;

    IF autre_mandat IS NOT NULL THEN

        RAISE EXCEPTION
            'La liquidation % est déjà intégrée au mandat %',
            NEW.liquidation_id,
            autre_mandat;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_liquidation_unique_mandat
ON mandat_liquidations;

CREATE TRIGGER trg_liquidation_unique_mandat
BEFORE INSERT OR UPDATE
ON mandat_liquidations
FOR EACH ROW
EXECUTE FUNCTION verifier_liquidation_unique_mandat();


-- ============================================================
-- 26. VERIFICATION DU MONTANT D'UNE LIGNE DE MANDAT
-- ============================================================

CREATE OR REPLACE FUNCTION verifier_montant_ligne_mandat()
RETURNS TRIGGER AS $$
DECLARE
    montant_liquidation NUMERIC(19,2);
BEGIN

    SELECT montant_ttc
    INTO montant_liquidation
    FROM liquidations
    WHERE id = NEW.liquidation_id;

    IF montant_liquidation IS NULL THEN

        RAISE EXCEPTION
            'Liquidation % introuvable',
            NEW.liquidation_id;

    END IF;

    IF NEW.montant > montant_liquidation THEN

        RAISE EXCEPTION
            'Le montant du mandat (%) dépasse le montant de la liquidation (%)',
            NEW.montant,
            montant_liquidation;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_montant_ligne_mandat
ON mandat_liquidations;

CREATE TRIGGER trg_montant_ligne_mandat
BEFORE INSERT OR UPDATE
ON mandat_liquidations
FOR EACH ROW
EXECUTE FUNCTION verifier_montant_ligne_mandat();

-- ============================================================
-- 28. TRIGGER : PAIEMENT EXECUTE -> MANDAT PAYE
-- ============================================================
--
-- Ce trigger garantit également la cohérence au niveau DB.
-- ============================================================

CREATE OR REPLACE FUNCTION synchroniser_mandat_apres_paiement()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.statut = 'EXECUTE' THEN

        UPDATE mandats
        SET statut = 'PAYE',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.mandat_id
          AND collectivite_id = NEW.collectivite_id
          AND statut = 'TRANSMIS_RECEVEUR';

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_paiement_execute_mandat
ON paiements;

CREATE TRIGGER trg_paiement_execute_mandat
AFTER INSERT OR UPDATE
ON paiements
FOR EACH ROW
EXECUTE FUNCTION synchroniser_mandat_apres_paiement();


-- ============================================================
-- 29. INDEX UNICITE NUMEROS PAR TENANT
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_engagement_numero_tenant
    ON engagements(collectivite_id, numero);

CREATE UNIQUE INDEX IF NOT EXISTS uq_liquidation_numero_tenant
    ON liquidations(collectivite_id, numero);

CREATE UNIQUE INDEX IF NOT EXISTS uq_liquidation_facture_tenant
    ON liquidations(collectivite_id, numero_facture);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mandat_numero_tenant
    ON mandats(collectivite_id, numero);

CREATE UNIQUE INDEX IF NOT EXISTS uq_paiement_numero_tenant
    ON paiements(collectivite_id, numero);

COMMIT;
