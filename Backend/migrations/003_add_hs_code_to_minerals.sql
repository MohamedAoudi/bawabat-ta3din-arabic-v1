ALTER TABLE minerals
  ADD COLUMN IF NOT EXISTS hs_code VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_minerals_hs_code ON minerals(hs_code);
