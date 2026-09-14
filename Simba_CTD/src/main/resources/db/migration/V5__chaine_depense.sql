CREATE TABLE engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    exercice_id UUID NOT NULL REFERENCES exercices_budgetaires(id),
    ligne_budgetaire_id UUID NOT NULL REFERENCES lignes_budgetaires(id),
    tiers_id UUID REFERENCES tiers(id),
    document_preparatoire_id UUID REFERENCES documents_preparatoires(id),
    numero VARCHAR(100) NOT NULL, type_engagement type_engagement NOT NULL,
    objet TEXT NOT NULL,
    montant_ht NUMERIC(19,2) NOT NULL DEFAULT 0, montant_taxes NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_ttc NUMERIC(19,2) NOT NULL DEFAULT 0, montant_engage NUMERIC(19,2) NOT NULL DEFAULT 0,
    statut statut_engagement NOT NULL DEFAULT 'BROUILLON',
    date_engagement DATE NOT NULL, soumis_cf_at TIMESTAMPTZ, vise_cf_at TIMESTAMPTZ,
    utilisateur_createur_id UUID REFERENCES utilisateurs(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, numero)
);
CREATE TABLE avis_controle_financier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
    controleur_id UUID NOT NULL REFERENCES utilisateurs(id),
    type_avis type_avis_controle NOT NULL, observations TEXT, reserves TEXT, tiers VARCHAR(100),
    date_reception TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, date_decision TIMESTAMPTZ,
    reference_document TEXT, autorisation_minfi TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE liquidations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    engagement_id UUID NOT NULL REFERENCES engagements(id),
    numero VARCHAR(100) NOT NULL, type_facture type_facture NOT NULL,
    numero_facture VARCHAR(100) NOT NULL, date_facture DATE NOT NULL,
    montant_ht NUMERIC(19,2) NOT NULL, montant_taxes NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_ttc NUMERIC(19,2) NOT NULL, montant_nap NUMERIC(19,2),
    statut statut_liquidation NOT NULL DEFAULT 'BROUILLON',
    service_fait_at TIMESTAMPTZ, conformite_fiscale BOOLEAN NOT NULL DEFAULT FALSE,
    observations TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, numero), UNIQUE (collectivite_id, numero_facture)
);
CREATE TABLE mandats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    exercice_id UUID NOT NULL REFERENCES exercices_budgetaires(id),
    numero VARCHAR(100) NOT NULL, type_mandat type_mandat NOT NULL,
    montant_total NUMERIC(19,2) NOT NULL DEFAULT 0,
    statut statut_mandat NOT NULL DEFAULT 'BROUILLON', date_mandatement DATE NOT NULL,
    ordonnateur_id UUID NOT NULL REFERENCES utilisateurs(id),
    controleur_id UUID REFERENCES utilisateurs(id), receveur_id UUID REFERENCES utilisateurs(id),
    bordereau_numero VARCHAR(100), depense_validee_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, numero)
);
CREATE TABLE mandat_liquidations (
    mandat_id UUID NOT NULL REFERENCES mandats(id) ON DELETE CASCADE,
    liquidation_id UUID NOT NULL REFERENCES liquidations(id) ON DELETE RESTRICT,
    montant NUMERIC(19,2) NOT NULL, PRIMARY KEY (mandat_id, liquidation_id)
);
CREATE TABLE paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    mandat_id UUID NOT NULL REFERENCES mandats(id),
    numero VARCHAR(100) NOT NULL, mode_reglement mode_reglement NOT NULL,
    montant_ttc NUMERIC(19,2) NOT NULL, montant_retenues NUMERIC(19,2) NOT NULL DEFAULT 0,
    montant_net_paye NUMERIC(19,2) NOT NULL,
    date_programmee DATE, date_execution DATE,
    statut statut_paiement NOT NULL DEFAULT 'PROGRAMME',
    reference_bancaire VARCHAR(150), reference_cheque VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, numero)
);