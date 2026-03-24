-- Sprint 16: Add company profile fields to deals table
-- These fields store company info at the deal stage (before a portfolio company record exists)

ALTER TABLE deals ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS company_linkedin TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS company_location TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS company_founded TEXT;  -- year string like "2021"
