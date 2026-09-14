BEGIN;

ALTER TABLE regularisations_470xx
    ADD COLUMN IF NOT EXISTS exercice_id UUID,
    ADD COLUMN IF NOT EXISTS ligne_budgetaire_id UUID,
    ADD COLUMN IF NOT EXISTS tiers_id UUID,
    ADD COLUMN IF NOT EXISTS controleur_financier_id UUID,
    ADD COLUMN IF NOT EXISTS comptabilisee_compte_470xx BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS contrepassation_470xx_auto_effectuee BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS alerte_j15_declenchee BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS alerte_j25_declenchee BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS alerte_critique BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS inscrit_registre_anomalies BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS notification_tutelle_envoyee BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS date_modification TIMESTAMPTZ;

UPDATE regularisations_470xx
SET comptabilisee_compte_470xx = COALESCE(comptabilisee_compte470xx, FALSE),
    contrepassation_470xx_auto_effectuee = COALESCE(contrepassation470xxautoeffectuee, FALSE),
    alerte_j15_declenchee = COALESCE(alertej15declenchee, FALSE),
    alerte_j25_declenchee = COALESCE(alertej25declenchee, FALSE),
    notification_tutelle_envoyee = COALESCE(notification_tutelle, FALSE),
    date_modification = COALESCE(date_modification, date_creation)
WHERE TRUE;

COMMIT;
