-- Create community_hosts table
create table if not exists public.community_hosts (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  full_name     text        not null,
  email         text        not null,
  phone_number  text
);

-- Enable Row Level Security
alter table public.community_hosts enable row level security;

-- Allow anonymous inserts (frontend uses anon key)
create policy "anon can insert community_hosts"
  on public.community_hosts
  for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policies. Read only via Dashboard.
