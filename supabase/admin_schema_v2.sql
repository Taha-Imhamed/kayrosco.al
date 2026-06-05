-- ============================================================
-- KAYROSCO ADMIN SCHEMA V2 — NEW FEATURES MIGRATION
-- Run this in Supabase SQL Editor AFTER admin_schema.sql
-- ============================================================

-- ── Revenue entries (monthly, per department) ─────────────────────────────────
create table if not exists revenue (
  id uuid primary key default gen_random_uuid(),
  month int not null check (month between 1 and 12),
  year int not null,
  department text not null check (department in ('tech','consulting','travel')),
  amount numeric(14,2) not null default 0,
  description text,
  created_by uuid references admin_users(id) on delete set null,
  created_by_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- ── Contract status & value (add columns to contracts) ───────────────────────
alter table contracts
  add column if not exists status text not null default 'active'
    check (status in ('draft','review','signed','active','expired')),
  add column if not exists value numeric(14,2),
  add column if not exists expires_at date;

-- ── Expense claims ────────────────────────────────────────────────────────────
create table if not exists expense_claims (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(14,2) not null,
  category text not null,
  department text check (department in ('tech','consulting','travel','admin')),
  submitted_by uuid references admin_users(id) on delete set null,
  submitted_by_username text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  reviewed_by uuid references admin_users(id) on delete set null,
  reviewed_by_username text,
  reviewed_at timestamptz,
  notes text,
  receipt_path text,
  receipt_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- ── Announcements banner ──────────────────────────────────────────────────────
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  level text not null default 'info'
    check (level in ('info','warning','urgent')),
  is_active boolean not null default true,
  created_by uuid references admin_users(id) on delete set null,
  created_by_username text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Client directory ──────────────────────────────────────────────────────────
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  department text check (department in ('tech','consulting','travel')),
  notes text,
  is_active boolean not null default true,
  created_by uuid references admin_users(id) on delete set null,
  created_by_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- ── Role permissions matrix ───────────────────────────────────────────────────
create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('admin','tech_staff','consulting_staff','travel_staff','viewer')),
  resource text not null,
  can_view boolean not null default false,
  can_create boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(role, resource)
);

-- Seed default permissions
insert into role_permissions (role, resource, can_view, can_create, can_edit, can_delete) values
  ('admin',             'staff',       true,  true,  true,  true),
  ('admin',             'budget',      true,  true,  true,  true),
  ('admin',             'contracts',   true,  true,  true,  true),
  ('admin',             'logs',        true,  false, false, false),
  ('admin',             'company',     true,  true,  true,  false),
  ('admin',             'expenses',    true,  true,  true,  true),
  ('admin',             'clients',     true,  true,  true,  true),
  ('admin',             'revenue',     true,  true,  true,  true),
  ('admin',             'announcements',true, true,  true,  true),
  ('tech_staff',        'contracts',   true,  true,  false, false),
  ('tech_staff',        'budget',      true,  false, false, false),
  ('tech_staff',        'expenses',    true,  true,  false, false),
  ('tech_staff',        'clients',     true,  false, false, false),
  ('tech_staff',        'revenue',     false, false, false, false),
  ('consulting_staff',  'contracts',   true,  true,  false, false),
  ('consulting_staff',  'budget',      true,  false, false, false),
  ('consulting_staff',  'expenses',    true,  true,  false, false),
  ('consulting_staff',  'clients',     true,  false, false, false),
  ('consulting_staff',  'revenue',     false, false, false, false),
  ('travel_staff',      'contracts',   true,  true,  false, false),
  ('travel_staff',      'budget',      true,  false, false, false),
  ('travel_staff',      'expenses',    true,  true,  false, false),
  ('travel_staff',      'clients',     true,  false, false, false),
  ('travel_staff',      'revenue',     false, false, false, false),
  ('viewer',            'contracts',   true,  false, false, false),
  ('viewer',            'budget',      true,  false, false, false),
  ('viewer',            'expenses',    true,  false, false, false),
  ('viewer',            'clients',     true,  false, false, false),
  ('viewer',            'revenue',     false, false, false, false)
on conflict (role, resource) do nothing;

-- ── Disable RLS on new tables ─────────────────────────────────────────────────
alter table revenue disable row level security;
alter table expense_claims disable row level security;
alter table announcements disable row level security;
alter table clients disable row level security;
alter table role_permissions disable row level security;
