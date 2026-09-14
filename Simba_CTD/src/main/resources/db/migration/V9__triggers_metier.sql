-- V9__triggers_metier.sql

CREATE OR REPLACE FUNCTION maj_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_utilisateurs_upd ON utilisateurs;
CREATE TRIGGER trg_utilisateurs_upd BEFORE UPDATE ON utilisateurs FOR EACH ROW EXECUTE FUNCTION maj_updated_at();

CREATE OR REPLACE FUNCTION check_plafond_regie() RETURNS TRIGGER AS $$
DECLARE plaf NUMERIC; total NUMERIC;
BEGIN
  SELECT plafond INTO plaf FROM regies WHERE id = NEW.regie_id;
  SELECT COALESCE(SUM(montant),0) INTO total FROM depenses_regie WHERE regie_id = NEW.regie_id AND id != NEW.id;
  IF NEW.montant + total > plaf THEN
    RAISE EXCEPTION 'RG-DEP-025: Depassement plafond %', plaf;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_depenses_plafond ON depenses_regie;
CREATE TRIGGER trg_depenses_plafond BEFORE INSERT OR UPDATE ON depenses_regie FOR EACH ROW EXECUTE FUNCTION check_plafond_regie();

CREATE OR REPLACE FUNCTION maj_solde_regie() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE regies SET solde = (SELECT COALESCE(SUM(montant),0) FROM depenses_regie WHERE regie_id = OLD.regie_id) WHERE id = OLD.regie_id;
    RETURN OLD;
  ELSE
    UPDATE regies SET solde = (SELECT COALESCE(SUM(montant),0) FROM depenses_regie WHERE regie_id = NEW.regie_id) WHERE id = NEW.regie_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_solde ON depenses_regie;
CREATE TRIGGER trg_solde AFTER INSERT OR UPDATE OR DELETE ON depenses_regie FOR EACH ROW EXECUTE FUNCTION maj_solde_regie();

CREATE OR REPLACE FUNCTION check_cachet_et_signature() RETURNS TRIGGER AS $$
DECLARE m_montant NUMERIC;
BEGIN
  SELECT montant_total INTO m_montant FROM mandats WHERE id = NEW.mandat_id;
  IF NEW.statut = 'EXECUTE' AND m_montant >= 100000 THEN
    IF NEW.reference_bancaire IS NULL AND NEW.reference_cheque IS NULL THEN
      RAISE EXCEPTION 'RG-DEP-017: Double signature + ref cheque/virement obligatoire >=100k';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_paiement_signature ON paiements;
CREATE TRIGGER trg_paiement_signature BEFORE UPDATE ON paiements FOR EACH ROW EXECUTE FUNCTION check_cachet_et_signature();

CREATE OR REPLACE VIEW v_alertes_paiements AS 
SELECT p.id, m.numero, m.montant_total, p.statut 
FROM paiements p 
JOIN mandats m ON p.mandat_id = m.id 
WHERE p.statut != 'EXECUTE';