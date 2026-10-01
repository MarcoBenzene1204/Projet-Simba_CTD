ALTER TYPE statut_paiement ADD VALUE IF NOT EXISTS 'DIFFERE';

ALTER TABLE paiements
    ADD COLUMN IF NOT EXISTS cachet_vu_bonapayer BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS receveur_signature_id UUID REFERENCES utilisateurs(id),
    ADD COLUMN IF NOT EXISTS date_signature_receveur TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cosignataire_signature_id UUID REFERENCES utilisateurs(id),
    ADD COLUMN IF NOT EXISTS date_signature_cosignataire TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS double_signature_requise BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS justification_differement TEXT;

CREATE OR REPLACE FUNCTION check_cachet_et_signature() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'EXECUTE' THEN
    IF NOT NEW.cachet_vu_bonapayer OR NEW.receveur_signature_id IS NULL
        OR NEW.date_signature_receveur IS NULL THEN
      RAISE EXCEPTION 'RG-DEP-017: Cachet VU BON A PAYER et signature du receveur obligatoires';
    END IF;

    IF (NEW.double_signature_requise OR NEW.montant_ttc >= 100000 OR NEW.mode_reglement <> 'CAISSE')
        AND (NEW.cosignataire_signature_id IS NULL
            OR NEW.date_signature_cosignataire IS NULL
            OR NEW.cosignataire_signature_id = NEW.receveur_signature_id) THEN
      RAISE EXCEPTION 'RG-DEP-017: Double signature par deux utilisateurs distincts obligatoire';
    END IF;

    IF NEW.mode_reglement = 'VIREMENT_BANCAIRE' AND (NEW.reference_bancaire IS NULL OR btrim(NEW.reference_bancaire) = '') THEN
      RAISE EXCEPTION 'La référence bancaire est obligatoire pour un virement bancaire';
    END IF;
    IF NEW.mode_reglement = 'CHEQUE' AND (NEW.reference_cheque IS NULL OR btrim(NEW.reference_cheque) = '') THEN
      RAISE EXCEPTION 'La référence du chèque est obligatoire pour un règlement par chèque';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;