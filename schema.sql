-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- 1. Create the table
create table if not exists tracker_data (
  id           integer primary key default 1,
  actuals      jsonb not null default '{}',
  other_actuals jsonb not null default '{}',
  updated_at   timestamptz default now()
);

-- 2. Ensure only ever one row exists
create unique index if not exists tracker_data_singleton on tracker_data(id);

-- 3. Insert the initial empty row
insert into tracker_data (id, actuals, other_actuals)
values (1, '{}', '{}')
on conflict (id) do nothing;

-- 4. Enable Row Level Security
alter table tracker_data enable row level security;

-- 5. Allow anyone to read (public dashboard)
create policy "public_read" on tracker_data
  for select using (true);

-- 6. Allow anyone with the anon key to update (passcode enforced in the app)
create policy "public_update" on tracker_data
  for update using (true);

-- 7. Enable real-time for live updates across browsers
alter publication supabase_realtime add table tracker_data;
