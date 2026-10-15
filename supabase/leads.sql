-- Run once in the Supabase SQL editor.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  monthly int not null,
  years int not null,
  variant text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  emailed_at timestamptz
);

-- Only the server (secret / service_role key) writes. No policy = anon and authenticated get nothing.
alter table public.leads enable row level security;
