BEGIN;

ALTER TABLE engagements
    ALTER COLUMN date_engagement TYPE DATE
    USING date_engagement::date;

COMMIT;