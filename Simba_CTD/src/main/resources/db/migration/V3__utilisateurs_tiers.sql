CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifiant_keycloak VARCHAR(255) NOT NULL UNIQUE,
    nom_utilisateur VARCHAR(100), prenom VARCHAR(100), nom VARCHAR(150),
    email CITEXT, telephone VARCHAR(30), matricule VARCHAR(100),
    collectivite_id UUID REFERENCES collectivites(id) ON DELETE RESTRICT,
    role role_application NOT NULL,
    statut statut_utilisateur NOT NULL DEFAULT 'ACTIF',
    dernier_acces TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ((role = 'SUPER_ADMINISTRATEUR' AND collectivite_id IS NULL) OR (role <> 'SUPER_ADMINISTRATEUR' AND collectivite_id IS NOT NULL))
);

CREATE TABLE tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, raison_sociale VARCHAR(255) NOT NULL,
    numero_contribuable VARCHAR(100), registre_commerce VARCHAR(100),
    adresse TEXT, telephone VARCHAR(30), email CITEXT,
    compte_bancaire VARCHAR(100), banque VARCHAR(150),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, code),
    UNIQUE (collectivite_id, numero_contribuable)
);