-- Run once in the Supabase SQL editor (after leads.sql).
-- When the comparison e-mail last went out to this address. Used for the 10-minute cooldown:
-- one atomic UPDATE claims the slot, so parallel requests cannot all send.
alter table public.leads add column if not exists emailed_at timestamptz;
