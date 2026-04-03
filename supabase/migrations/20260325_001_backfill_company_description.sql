-- Sprint 16 follow-up: Backfill company_description from deals to companies
-- When a deal is closed and promoted to a company via close-deal-dialog,
-- the company_description from the deal should populate companies.description.
--
-- This migration backfills any existing promoted deals where the company
-- already exists but description wasn't copied at promotion time.

UPDATE companies c
SET description = d.company_description
FROM deals d
WHERE d.promoted_transaction_id IS NOT NULL
  AND d.company_id = c.id
  AND d.company_description IS NOT NULL
  AND d.company_description != ''
  AND (c.description IS NULL OR c.description = '');
