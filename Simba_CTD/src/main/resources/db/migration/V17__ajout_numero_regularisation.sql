BEGIN;

ALTER TABLE regularisations_470xx
    ADD COLUMN IF NOT EXISTS numero VARCHAR(100);

UPDATE regularisations_470xx
SET numero = 'REG-470XX-' || LEFT(id::text, 8)
WHERE numero IS NULL;

ALTER TABLE regularisations_470xx
    ALTER COLUMN numero SET NOT NULL;

COMMIT;