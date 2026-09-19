-- KAYROSCO ADMIN SCHEMA v8
-- Adds private visibility to admin tasks. Run in Supabase SQL Editor.

alter table if exists admin_tasks
  add column if not exists is_private boolean not null default false;

create index if not exists idx_admin_tasks_visibility
  on admin_tasks (is_private, created_at desc);