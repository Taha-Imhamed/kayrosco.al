-- Insert default company info row
insert into company_info (company_name, nip_number, address, founder_name, phone, email)
values (
  'Kayrosco Group',
  '',
  'Rruga e Kavajes, Pallati 18/A, Kati 3, Tirana 1001',
  '',
  '+355 42 XXX XXXX',
  'info@kayrosco.com'
)
on conflict do nothing;
-- ============================================================
-- KAYROSCO ADMIN SCHEMA MIGRATION
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- Admin users table (separate from auth.users / profiles)
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  email text,
  role text not null default 'viewer'
    check (role in ('admin', 'tech_staff', 'consulting_staff', 'travel_staff', 'viewer')),
  department text
    check (department in ('tech', 'consulting', 'travel', 'admin')),
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now()
);

-- MVP: password stored as $plain$<password>
insert into admin_users (username, password_hash, email, role, department)
values (
  'memo',
  '$plain$tmm2010mt',
  'admin@kayrosco.com',
  'admin',
  'admin'
)
on conflict (username) do nothing;

-- Activity logs
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references admin_users(id) on delete set null,
  username text,
  action text not null,
  action_type text not null
    check (action_type in ('login','logout','create','edit','delete','download','upload')),
  department text,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Contracts
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('tech','consulting','travel')),
  type text not null check (type in ('internal','client','government')),
  uploaded_by uuid references admin_users(id) on delete set null,
  uploaded_by_username text,
  file_name text,
  storage_path text,
  description text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Budget
create table if not exists budget (
  id uuid primary key default gen_random_uuid(),
  month int not null check (month between 1 and 12),
  year int not null,
  category text not null,
  allocated_amount numeric(14,2) not null default 0,
  spent_amount numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Company info (single row, use upsert)
create table if not exists company_info (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  nip_number text,
  address text,
  bank_account text,
  founder_name text,
  phone text,
  email text,
  updated_at timestamptz not null default now()
);

-- Tasks / Quick-access items for dashboard
create table if not exists admin_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_to uuid references admin_users(id) on delete set null,
  assigned_to_username text,
  department text check (department in ('tech','consulting','travel','admin')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'open' check (status in ('open','in_progress','done')),
  due_date date,
  created_by uuid references admin_users(id) on delete set null,
  created_by_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Notes / Announcements
create table if not exists admin_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  author_id uuid references admin_users(id) on delete set null,
  author_username text,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);


-- ── Storage buckets ──────────────────────────────────────────────────────────

-- Contracts bucket (private, signed URLs for download)
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

-- Allow anon/authenticated to upload to contracts bucket
drop policy if exists "contracts_bucket_upload_anon" on storage.objects;
create policy "contracts_bucket_upload_anon"
on storage.objects for insert
with check (bucket_id = 'contracts');

-- Allow anon/authenticated to read (for signed URL generation)
drop policy if exists "contracts_bucket_read_anon" on storage.objects;
create policy "contracts_bucket_read_anon"
on storage.objects for select
using (bucket_id = 'contracts');

-- Allow delete for cleanup
drop policy if exists "contracts_bucket_delete_anon" on storage.objects;
create policy "contracts_bucket_delete_anon"
on storage.objects for delete
using (bucket_id = 'contracts');

-- ── Disable RLS on all admin tables (MVP: protected by app logic) ─────────────
alter table admin_users disable row level security;
alter table activity_logs disable row level security;
alter table contracts disable row level security;
alter table budget disable row level security;
alter table company_info disable row level security;
alter table admin_tasks disable row level security;
alter table admin_notes disable row level security;
