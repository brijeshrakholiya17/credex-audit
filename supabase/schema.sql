-- Run in Supabase SQL editor before using share links

create table if not exists shared_audits (
  id uuid primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table shared_audits enable row level security;

-- Allow anonymous inserts and reads (tighten in production)
create policy "Allow public insert on shared_audits"
  on shared_audits for insert
  with check (true);

create policy "Allow public read on shared_audits"
  on shared_audits for select
  using (true);

-- Leads captured from email modal

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text,
  team_size text,
  audit_data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_email_created_at_idx on leads (email, created_at desc);

alter table leads enable row level security;

create policy "Allow public insert on leads"
  on leads for insert
  with check (true);
