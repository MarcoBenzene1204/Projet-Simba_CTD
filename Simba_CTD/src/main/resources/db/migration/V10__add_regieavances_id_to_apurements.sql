-- Les entités JPA de régie d'avances utilisent des identifiants UUID.  La
-- première version de cette migration faisait référence à une table et à un
-- type inexistants (regie_avances / BIGINT), ce qui empêchait Flyway de
-- démarrer sur une base neuve.
CREATE TABLE regies_avances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_regie VARCHAR(255) NOT NULL UNIQUE,
    date_creation DATE NOT NULL,
    periodicite VARCHAR(30) NOT NULL DEFAULT 'TRIMESTRIELLE',
    regisseur_id UUID NOT NULL REFERENCES utilisateurs(id),
    numero_deliberation VARCHAR(255) NOT NULL,
    date_deliberation DATE NOT NULL,
    date_approval_deliberation DATE NOT NULL,
    montant_plafond NUMERIC(19,2) NOT NULL,
    montant_total NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_engages NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_autorises NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_ordonnances NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_paye NUMERIC(19,2) NOT NULL DEFAULT 0,
    solde_disponible NUMERIC(19,2) NOT NULL,
    natures_autorisees TEXT NOT NULL,
    etat VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    montant_dernier_reconstitution NUMERIC(19,2),
    date_dernier_reconstitution DATE,
    regie_cloture_exercice BOOLEAN NOT NULL DEFAULT FALSE,
    date_cloture_exercice DATE,
    solde_reversement NUMERIC(19,2),
    date_reversement_effectuee TIMESTAMP,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE depenses_regie
    ADD COLUMN regie_avances_id UUID REFERENCES regies_avances(id),
    ADD COLUMN nature VARCHAR(100),
    ADD COLUMN description TEXT,
    ADD COLUMN url_justificatifs TEXT,
    ADD COLUMN etat VARCHAR(30);

ALTER TABLE apurements_regies
    ADD COLUMN regieavances_id UUID REFERENCES regies_avances(id);
