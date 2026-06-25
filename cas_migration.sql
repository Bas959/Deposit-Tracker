-- Add cas_actuals column to tracker_data for the CAS counter feature
ALTER TABLE tracker_data
  ADD COLUMN IF NOT EXISTS cas_actuals jsonb NOT NULL DEFAULT '{}'::jsonb;
