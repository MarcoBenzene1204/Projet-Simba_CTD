CREATE TABLE exercices_budgetaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL, type_exercice type_exercice NOT NULL DEFAULT 'NORMAL',
    date_debut DATE NOT NULL, date_fin DATE NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT FALSE, cloture BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, annee)
);
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    exercice_id UUID NOT NULL REFERENCES exercices_budgetaires(id) ON DELETE RESTRICT,
    type_budget type_budget NOT NULL, numero VARCHAR(50), libelle VARCHAR(255),
    montant_total NUMERIC(19,2) NOT NULL DEFAULT 0,
    statut statut_budget NOT NULL DEFAULT 'BROUILLON', date_approbation DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE lignes_budgetaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    exercice_id UUID NOT NULL REFERENCES exercices_budgetaires(id),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    code VARCHAR(100) NOT NULL, libelle VARCHAR(255) NOT NULL,
    section VARCHAR(100), chapitre VARCHAR(100), article VARCHAR(100), compte VARCHAR(100),
    credit_vote NUMERIC(19,2) NOT NULL DEFAULT 0, credit_modifie NUMERIC(19,2) NOT NULL DEFAULT 0,
    credit_engage NUMERIC(19,2) NOT NULL DEFAULT 0, credit_liquide NUMERIC(19,2) NOT NULL DEFAULT 0,
    credit_mandate NUMERIC(19,2) NOT NULL DEFAULT 0, credit_paye NUMERIC(19,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, exercice_id, code)
);
CREATE TABLE documents_preparatoires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    reference VARCHAR(100) NOT NULL, type_document type_engagement NOT NULL,
    objet TEXT, tiers_id UUID REFERENCES tiers(id) ON DELETE RESTRICT,
    montant_ht NUMERIC(19,2), montant_taxes NUMERIC(19,2), montant_ttc NUMERIC(19,2),
    date_document DATE, montant_consomme NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_restant NUMERIC(19,2), statut VARCHAR(50),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, reference)
);