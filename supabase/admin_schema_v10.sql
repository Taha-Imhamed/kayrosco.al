-- KAYROSCO ADMIN SCHEMA v10
-- Shared pictures and logos media library.
-- Run this in the Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('admin-media', 'admin-media', true)
on conflict (id) do update set public = true;

create table if not exists admin_media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_name text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references admin_users(id) on delete set null,
  uploaded_by_username text,
  created_at timestamptz not null default now()
);

alter table admin_media disable row level security;

drop policy if exists "admin media public read" on storage.objects;
create policy "admin media public read"
on storage.objects for select
using (bucket_id = 'admin-media');

drop policy if exists "admin media upload" on storage.objects;
create policy "admin media upload"
on storage.objects for insert
with check (bucket_id = 'admin-media');

drop policy if exists "admin media delete" on storage.objects;
create policy "admin media delete"
on storage.objects for delete
using (bucket_id = 'admin-media');