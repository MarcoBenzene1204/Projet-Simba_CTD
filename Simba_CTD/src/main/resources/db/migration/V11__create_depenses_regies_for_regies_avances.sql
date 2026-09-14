-- L'entité DepenseRegie est mappée sur depenses_regies.  V6 avait créé
-- depenses_regie (singulier), une table utilisée par l'ancien modèle de
-- régies ; la table ci-dessous est celle du modèle RegieAvances actuel.
CREATE TABLE depenses_regies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regie_avances_id UUID NOT NULL REFERENCES regies_avances(id) ON DELETE CASCADE,
    nature VARCHAR(100) NOT NULL,
    montant NUMERIC(15,2) NOT NULL,
    date_depense DATE NOT NULL,
    description TEXT NOT NULL,
    url_justificatifs VARCHAR(255),
    etat VARCHAR(30) NOT NULL
);

CREATE INDEX idx_depenses_regies_regie_avances
    ON depenses_regies(regie_avances_id);
