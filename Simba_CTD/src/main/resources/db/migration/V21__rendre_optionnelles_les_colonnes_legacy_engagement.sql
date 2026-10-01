-- Les colonnes historiques restent disponibles, mais les écritures utilisent
-- désormais les colonnes canoniques définies dans V5 et alignées dans V15.
ALTER TABLE engagements
    ALTER COLUMN documentm5id DROP NOT NULL,
    ALTER COLUMN etat DROP NOT NULL,
    ALTER COLUMN lignebudgetaire_id DROP NOT NULL,
    ALTER COLUMN montantht DROP NOT NULL,
    ALTER COLUMN montantttc DROP NOT NULL,
    ALTER COLUMN montanttva DROP NOT NULL,
    ALTER COLUMN numero_engagement DROP NOT NULL,
    ALTER COLUMN tauxtva DROP NOT NULL;