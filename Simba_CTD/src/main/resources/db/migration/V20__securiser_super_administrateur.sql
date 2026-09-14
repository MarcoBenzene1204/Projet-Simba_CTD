-- Un profil métier est la seule source d'association Simba/Keycloak.
-- Cette contrainte empêche plusieurs profils globaux accidentels.
CREATE UNIQUE INDEX IF NOT EXISTS uq_utilisateur_super_administrateur
    ON utilisateurs (role)
    WHERE role = 'SUPER_ADMINISTRATEUR';