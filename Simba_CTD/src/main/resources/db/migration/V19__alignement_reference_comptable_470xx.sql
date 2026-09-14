BEGIN;

ALTER TABLE regularisations_470xx
    ADD COLUMN IF NOT EXISTS numero_ecriture_comptable_470xx VARCHAR(150);

UPDATE regularisations_470xx
SET numero_ecriture_comptable_470xx = numero_ecriture_comptable470xx
WHERE numero_ecriture_comptable_470xx IS NULL;

COMMIT;