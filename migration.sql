-- Run this in Supabase SQL Editor to add editable targets
-- (Only needed if you already ran schema.sql previously)

ALTER TABLE tracker_data
  ADD COLUMN IF NOT EXISTS targets jsonb NOT NULL DEFAULT '{}';

-- Seed with the default targets
UPDATE tracker_data SET targets = '{
  "MSc Nursing Practice – London":     {"lon": 20, "sun": 0},
  "MSc Public Health":                 {"lon": 20, "sun": 40},
  "MSc Nursing":                       {"lon": 0,  "sun": 40},
  "MBA Business Administration":       {"lon": 15, "sun": 25},
  "MSc Cybersecurity":                 {"lon": 0,  "sun": 20},
  "MSc Data Science":                  {"lon": 0,  "sun": 50},
  "MSc Computing":                     {"lon": 0,  "sun": 40},
  "MSc Engineering Management":        {"lon": 0,  "sun": 15},
  "MSc Digital Marketing & Analytics": {"lon": 0,  "sun": 20}
}'::jsonb WHERE id = 1;
