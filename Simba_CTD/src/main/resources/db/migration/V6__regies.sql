CREATE TABLE regies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    exercice_id UUID NOT NULL REFERENCES exercices_budgetaires(id),
    code VARCHAR(50) NOT NULL, libelle VARCHAR(255) NOT NULL,
    type_regie type_regie NOT NULL DEFAULT 'AVANCES',
    plafond NUMERIC(19,2) NOT NULL, solde NUMERIC(19,2) NOT NULL DEFAULT 0,
    nature_depenses JSONB NOT NULL DEFAULT '[]'::jsonb,
    deliberation_reference VARCHAR(150), date_creation DATE NOT NULL,
    statut statut_regie NOT NULL DEFAULT 'ACTIVE',
    regisseur_id UUID NOT NULL REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, code)
);
CREATE TABLE depenses_regie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    regie_id UUID NOT NULL REFERENCES regies(id) ON DELETE CASCADE,
    reference VARCHAR(100) NOT NULL, objet TEXT NOT NULL,
    montant NUMERIC(19,2) NOT NULL, date_depense DATE NOT NULL,
    justificatif_url TEXT, apuree BOOLEAN NOT NULL DEFAULT FALSE,
    ordonnee BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, reference)
);
CREATE TABLE apurements_regies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    regie_id UUID NOT NULL REFERENCES regies(id) ON DELETE CASCADE,
    date_periode DATE NOT NULL, montant_soumis NUMERIC(38,2) NOT NULL,
    controller_financier_visa_id UUID REFERENCES utilisateurs(id),
    date_visa_cf TIMESTAMP, etat VARCHAR(50) NOT NULL DEFAULT 'EN_COURS'
);