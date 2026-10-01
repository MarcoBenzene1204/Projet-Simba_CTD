CREATE TABLE simba_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destinataire_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    collectivite_id UUID NOT NULL REFERENCES collectivites(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    titre VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    lien VARCHAR(500),
    cree_le TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lu_le TIMESTAMPTZ
);

CREATE INDEX idx_simba_notifications_destinataire_date
    ON simba_notifications (destinataire_id, cree_le DESC);

CREATE INDEX idx_simba_notifications_destinataire_non_lues
    ON simba_notifications (destinataire_id, cree_le DESC)
    WHERE lu_le IS NULL;