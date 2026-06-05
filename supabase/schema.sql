-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Profiles (mirrors auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role text not null default 'worker' check (role in ('admin', 'worker')),
  area text not null default 'all' check (area in ('travel', 'ealbana', 'tech', 'all')),
  created_at timestamptz not null default now()
);

-- Workers managed by admin dashboard
create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  role_area text not null default 'travel' check (role_area in ('travel', 'ealbana', 'tech', 'all')),
  role_title text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists workers_email_key on workers(lower(email));

create table if not exists service_catalog (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('travel', 'ealbana', 'tech')),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists company_settings (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('global', 'travel', 'ealbana', 'tech')),
  phone text,
  email text,
  address text,
  updated_at timestamptz not null default now()
);

create unique index if not exists company_settings_area_key on company_settings(area);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique,
  service_area text not null check (service_area in ('travel', 'ealbana', 'tech')),
  service_type text not null,
  status text not null default 'new' check (status in ('new','in_review','awaiting_docs','in_progress','completed')),
  full_name text,
  email text,
  phone text,
  data jsonb,
  assigned_worker_id uuid references workers(id),
  due_at timestamptz,
  report text,
  created_at timestamptz not null default now()
);

create table if not exists request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references service_requests(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Helper functions
create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create profile rows
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, role, area)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    'worker',
    'all'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table workers enable row level security;
alter table service_catalog enable row level security;
alter table company_settings enable row level security;
alter table service_requests enable row level security;
alter table request_files enable row level security;

create policy "profiles_select_self_or_admin"
on profiles for select
using (auth.uid() = id or is_admin());

create policy "profiles_update_admin"
on profiles for update
using (is_admin());

create policy "workers_admin_access"
on workers for all
using (is_admin())
with check (is_admin());

create policy "service_catalog_public_select"
on service_catalog for select
using (true);

create policy "service_catalog_admin_write"
on service_catalog for all
using (is_admin())
with check (is_admin());

create policy "company_settings_public_select"
on company_settings for select
using (true);

create policy "company_settings_admin_write"
on company_settings for all
using (is_admin())
with check (is_admin());

create policy "service_requests_public_insert"
on service_requests for insert
with check (true);

create policy "service_requests_admin_select"
on service_requests for select
using (is_admin());

create policy "service_requests_admin_update"
on service_requests for update
using (is_admin());

create policy "request_files_admin_select"
on request_files for select
using (is_admin());

create policy "request_files_public_insert"
on request_files for insert
with check (true);

-- Public tracking RPC (returns only the matching request)
create or replace function get_request_by_tracking_id(p_tracking_id text, p_area text)
returns table (
  id uuid,
  tracking_id text,
  service_area text,
  service_type text,
  status text,
  full_name text,
  email text,
  phone text,
  data jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    id,
    tracking_id,
    service_area,
    service_type,
    status,
    full_name,
    email,
    phone,
    data,
    created_at
  from service_requests
  where tracking_id = p_tracking_id
    and service_area = p_area
  limit 1;
$$;

grant execute on function get_request_by_tracking_id(text, text) to anon, authenticated;

-- Storage bucket for PDFs
insert into storage.buckets (id, name, public)
values ('request-files', 'request-files', false)
on conflict (id) do nothing;

create policy "request_files_bucket_read"
on storage.objects for select
using (bucket_id = 'request-files' and auth.role() = 'authenticated');

create policy "request_files_bucket_upload"
on storage.objects for insert
with check (bucket_id = 'request-files' and auth.role() in ('anon','authenticated'));

