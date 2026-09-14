ALTER TABLE regularisations_470xx
ADD COLUMN liquidation_regularisation_id UUID;

ALTER TABLE regularisations_470xx
ADD CONSTRAINT fk_regularisation_liquidation
FOREIGN KEY (liquidation_regularisation_id)
REFERENCES liquidations(id);

CREATE UNIQUE INDEX ux_regularisation_liquidation
ON regularisations_470xx(liquidation_regularisation_id)
WHERE liquidation_regularisation_id IS NOT NULL;
ALTER TABLE regularisations_470xx
ADD COLUMN document_m5_id UUID;