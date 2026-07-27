-- Add last_updated column to tracker_data so the header "Updated" timestamp is
-- a single shared value written on every save and synced to all browsers via realtime.
ALTER TABLE tracker_data
  ADD COLUMN IF NOT EXISTS last_updated timestamptz;

-- Backfill the existing row so the header shows a value before the first save.
UPDATE tracker_data
  SET last_updated = coalesce(last_updated, updated_at, now())
  WHERE id = 1;
