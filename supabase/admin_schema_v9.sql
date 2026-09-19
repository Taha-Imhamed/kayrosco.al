-- KAYROSCO ADMIN SCHEMA v9
-- Shared admin social account credentials.
-- Run this in the Supabase SQL Editor.

create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text not null,
  password text not null,
  created_by uuid references admin_users(id) on delete set null,
  created_by_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table social_accounts disable row level security;