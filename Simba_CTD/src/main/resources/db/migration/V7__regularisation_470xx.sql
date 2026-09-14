CREATE TABLE regularisations_470xx (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    date_detection TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference_paiement_detecte VARCHAR(255) NOT NULL,
    engagement_id UUID REFERENCES engagements(id),
    montant_detecte NUMERIC(38,2) NOT NULL CHECK (montant_detecte > 0),
    montant_imputation NUMERIC(38,2) NOT NULL,
    nature_depense VARCHAR(255) NOT NULL, description TEXT,
    receveur_id UUID NOT NULL REFERENCES utilisateurs(id),
    ordonnateur_id UUID NOT NULL REFERENCES utilisateurs(id),
    controleur_id UUID REFERENCES utilisateurs(id),
    etat EtatRegularisation NOT NULL DEFAULT 'DETECTEE',
    comptabilisee_compte470xx BOOLEAN NOT NULL DEFAULT FALSE,
    numero_ecriture_comptable470xx VARCHAR(255),
    date_notification_ordonnateur TIMESTAMPTZ, ordonnateur_notifie BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation_engagement TIMESTAMPTZ, date_visa_cf TIMESTAMPTZ, delai_visa_cf INTEGER DEFAULT 15,
    mandat_regularisation_id UUID REFERENCES mandats(id),
    contrepassation_auto BOOLEAN NOT NULL DEFAULT FALSE, numero_ecriture_contrepassation VARCHAR(255),
    date_echeance_regularisation DATE NOT NULL, alerte_j15 BOOLEAN DEFAULT FALSE, alerte_j25 BOOLEAN DEFAULT FALSE,
    alerte_critique BOOLEAN DEFAULT FALSE, date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    motif_rejet_cf TEXT, inscrit_registre_anomalies BOOLEAN DEFAULT FALSE, notification_tutelle BOOLEAN DEFAULT FALSE
);
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL, message TEXT NOT NULL,
    niveau niveau_notification NOT NULL DEFAULT 'INFO',
    lu BOOLEAN NOT NULL DEFAULT FALSE, date_lecture TIMESTAMPTZ,
    lien VARCHAR(500), metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE journal_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID REFERENCES collectivites(id) ON DELETE SET NULL,
    utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, table_concernee VARCHAR(150),
    identifiant_enregistrement UUID, ancienne_valeur JSONB, nouvelle_valeur JSONB,
    adresse_ip INET, user_agent TEXT, date_action TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);