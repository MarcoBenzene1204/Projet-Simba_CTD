CREATE TABLE collectivites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    nom VARCHAR(255) NOT NULL,
    type type_collectivite NOT NULL,
    region VARCHAR(150), departement VARCHAR(150), arrondissement VARCHAR(150),
    adresse TEXT, telephone VARCHAR(30), email CITEXT,
    logo_url TEXT,
    statut statut_collectivite NOT NULL DEFAULT 'ACTIVE',
    fuseau_horaire VARCHAR(80) NOT NULL DEFAULT 'Africa/Douala',
    devise VARCHAR(10) NOT NULL DEFAULT 'XAF',
    couleur_principale VARCHAR(7) NOT NULL DEFAULT '#14532D',
    couleur_accent VARCHAR(7) NOT NULL DEFAULT '#D9A441',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configurations_visuelles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL UNIQUE REFERENCES collectivites(id) ON DELETE CASCADE,
    couleur_primaire VARCHAR(20) NOT NULL DEFAULT '#2563EB',
    couleur_secondaire VARCHAR(20) NOT NULL DEFAULT '#64748B',
    couleur_accent VARCHAR(20) NOT NULL DEFAULT '#0EA5E9',
    couleur_succes VARCHAR(20) NOT NULL DEFAULT '#16A34A',
    couleur_avertissement VARCHAR(20) NOT NULL DEFAULT '#F59E0B',
    couleur_erreur VARCHAR(20) NOT NULL DEFAULT '#DC2626',
    couleur_information VARCHAR(20) NOT NULL DEFAULT '#2563EB',
    couleur_fond VARCHAR(20) NOT NULL DEFAULT '#FFFFFF',
    couleur_surface VARCHAR(20) NOT NULL DEFAULT '#F8FAFC',
    couleur_texte VARCHAR(20) NOT NULL DEFAULT '#0F172A',
    police_principale VARCHAR(100) NOT NULL DEFAULT 'Inter',
    police_secondaire VARCHAR(100) NOT NULL DEFAULT 'Inter',
    police_titres VARCHAR(100) NOT NULL DEFAULT 'Inter',
    taille_police_base VARCHAR(20) NOT NULL DEFAULT '16px',
    rayon_bordure VARCHAR(20) NOT NULL DEFAULT '0.5rem',
    mode_affichage VARCHAR(20) NOT NULL DEFAULT 'SYSTEME',
    variables_css JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parametres_reglementaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL, libelle VARCHAR(255) NOT NULL,
    valeur_numerique NUMERIC(19,6), valeur_texte TEXT, valeur_booleenne BOOLEAN,
    unite VARCHAR(50), description TEXT, date_debut DATE, date_fin DATE,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, code)
);

CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL, libelle VARCHAR(255) NOT NULL,
    icone VARCHAR(100), chemin VARCHAR(255), ordre INTEGER NOT NULL DEFAULT 0,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    roles_autorises JSONB NOT NULL DEFAULT '[]'::jsonb,
    UNIQUE (collectivite_id, code)
);

CREATE TABLE fonctionnalites_collectivites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collectivite_id, code)
);

INSERT INTO collectivites (code, nom, type, region, departement, arrondissement, adresse, telephone, email)
VALUES ('CTD-YDE-001','Commune de Yaoundé','COMMUNE','Centre','Mfoundi','Yaoundé','Yaoundé, Centre, Cameroun','+237 600000000','contact@communeyaounde.cm');